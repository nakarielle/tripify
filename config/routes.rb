Rails.application.routes.draw do


  get '/' => 'pages#index'
  # get '/l' => 'pages#layout'
  get '/trip' => "trip#index"
  get '/trip/new' => "trip#create"

  get '/trip/:trip_id' => "trip#stop"
  post '/trip/:trip_id' => "trip#add_stop"

  get '/:url' => "pages#routing"
  # get '/:disp_url' => "pages#display"
  # get '/:edit_url/edit' => "pages#edit"
end
