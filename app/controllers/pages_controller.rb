class PagesController < ApplicationController

  def index
  end

  def display
  	@stops = Trip.find_by(disp_url: params[:disp_url]).stops.order(:arrived_at)
  end
end