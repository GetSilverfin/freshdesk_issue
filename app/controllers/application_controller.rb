class ApplicationController < ActionController::Base
  def home
    sleep(rand.round(2))
    render :main
  end

  def one
    sleep(rand.round(2))
    render :main
  end

  def two
    sleep(rand.round(2))
    render :main
  end

  def three
    sleep(rand.round(2))
    render :main
  end

  def four
    sleep(rand.round(2))
    render :main
  end

  def five
    sleep(rand.round(2))
    render :main
  end
end
