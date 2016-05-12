class PagesController < ApplicationController

  def index
  end

  def display
  	@trip = Trip.find_by(disp_url: params[:disp_url])
  end
end




