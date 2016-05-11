Rails.application.routes.draw do


  get '/' => 'pages#index'

  get '/trip' => "trip#index"
  get '/trip/new' => "trip#create"

end
