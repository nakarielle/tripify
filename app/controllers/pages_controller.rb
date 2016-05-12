class PagesController < ApplicationController

  def index
  end

  def display
  	@trip = Trip.find_by(disp_url: params[:disp_url])
  end

  def edit
    @trip = Trip.find_by(edit_url: params[:edit_url])
  end
end




