class PagesController < ApplicationController

  def index
  end

  # def display
  # 	@trip = Trip.find_by(disp_url: params[:disp_url])
  # end

  # def edit
  #   @trip = Trip.find_by(edit_url: params[:edit_url])
  # end

  def routing
  	if !!Trip.find_by(edit_url: params[:url])
  		@trip = Trip.find_by(edit_url: params[:url])
  		render :edit
  	elsif !!Trip.find_by(disp_url: params[:url])
  		@trip = Trip.find_by(disp_url: params[:url])
  		render :display
  	else
  		render "Error 9000 | Url not found"
  	end	
  end
end




