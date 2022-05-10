let freshworksWidgetInitialized = false
let widgetFrame = null
let launcherContainer = null
let launcherFrame = null

class FreshdeskWidgetInitializationError extends Error {
  constructor() {
    const message = "Could not initialize the Freshdesk help widget appropriately"
    super(message)
    this.name = "FreshdeskWidgetInitializationError"
    this.message = message
  }
}

if (!window.customizeFreshdeskWidget) {
  window.customizeFreshdeskWidget = function(maxRetries, reRaiseError, currentAttempt = 1) {
    if (freshworksWidgetInitialized) {
      return
    }

    try {
      window.FreshworksWidget("hide", "launcher")
      window.FreshworksWidget("identify", "ticketForm", window.freshdeskWidgetData)
      window.FreshworksWidget("hide", "ticketForm", ["name", "email"])

      freshworksWidgetInitialized = true
    } catch(error) {
      if (currentAttempt >= maxRetries) {
        if (reRaiseError) {
          throw new FreshdeskWidgetInitializationError()
        }
      } else {
        setTimeout(function() {
          window.customizeFreshdeskWidget(maxRetries, reRaiseError, currentAttempt + 1)
        }, 100)
      }
    }
  }
}

document.addEventListener("turbolinks:click", function() {
  try {
    window.FreshworksWidget("destroy")
  } catch (error) {
    console.log(`** ${error.message} **`)
  }
  freshworksWidgetInitialized = false
  delete window.FreshworksWidget
  widgetFrame = null
  launcherContainer = null
  launcherFrame = null
})

// We wan't to ignore errors on the code for the freshdesk widget
window.onerror = function(_message, source, _lineno, _colno, _error) {
  if (source === "https://euc-widget.freshworks.com/widgets/101000001762.js") {
    console.log("Error from Freshdesk catched")
    return true
  }
}

const config = { childList: true, subtree: true }

/* 
 * We observe when some elements are added to the page with two goals:
 *   1) Don't let the freshdesk scripts to add duplicated elements to the page
 *   2) Execute our customizations for the freshdesk widget when those elements
 *      are added
 */
const callback = function(mutationsList, _observer) {
  if (!document.body) {
    return
  }

  if (!document.body.querySelector("#freshworks-frame") && !document.getElementById("freshworks-container")) {
    return
  }

  for (const mutation of mutationsList) {
    if (mutation.addedNodes.length > 0) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.tagName === "IFRAME" && addedNode.id === "freshworks-frame") {
          if (widgetFrame) {
            widgetFrame.parentElement.removeChild(widgetFrame)
          }

          widgetFrame = addedNode
          window.customizeFreshdeskWidget(10, false)
        }

        if (addedNode.id === "freshworks-container") {
          if (launcherContainer) {
            launcherContainer.parentElement.removeChild(launcherContainer)
          }

          launcherContainer = addedNode
        }

        if (addedNode.tagName === "IFRAME" && addedNode.id === "lightbox-frame") {
          if (launcherFrame) {
            launcherFrame.parentElement.removeChild(launcherFrame)
          }

          launcherFrame = addedNode
          window.customizeFreshdeskWidget(250, true)
        }
      }
    }
  }
}

const observer = new MutationObserver(callback)

observer.observe(document, config)
