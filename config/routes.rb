Rails.application.routes.draw do


  get '/' => 'pages#index'

  get '/trip' => "trip#index"
  get '/trip/new' => "trip#create"

  get '/trip/:trip_id' => "trip#stop"
  post '/trip/:trip_id' => "trip#add_stop"

end
