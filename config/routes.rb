Rails.application.routes.draw do


  get '/' => 'pages#index'

  get '/trips' => "trips#index"

end
