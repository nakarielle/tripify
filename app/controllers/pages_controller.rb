class PagesController < ApplicationController

  def index
  end

  def display
  	@stops = Trip.find_by(disp_url: params[:disp_url]).stops.order(:arrived_at)
 		@geo_json = [{
	    "type" => "FeatureCollection",
	    "features" => [{
	        "type" => "Feature",
	        "geometry" => {
	          "type" => "Point",
	          "coordinates" => [ 35.90556, 14.47611 ]},
	        "properties" => {
	          "marker-symbol" => "airport",
	          "marker-size" => "medium",
	          "marker-color" => "#FF0000",
	          "title" => "Saint John"
	        }
	    }]
	  	}].to_json
      @trip_id = Trip.find_by(disp_url: params[:disp_url])
  end
end




