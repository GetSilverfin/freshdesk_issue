Rails.application.routes.draw do
  root to: "application#home"

  get "/one",   to: "application#one"
  get "/two",   to: "application#two"
  get "/three", to: "application#three"
  get "/four",  to: "application#four"
  get "/five",  to: "application#five"
end
