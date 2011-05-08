require 'rubygems'
require 'sinatra'
require 'pusher'
require 'json'

set :public, Proc.new { File.join(root, "public") }

post '/pusher/auth' do

  Pusher.app_id = '5420'
  Pusher.key = '4aeaafae8e422b589d9a'
  Pusher.secret = '3e63d5542aee4d876dde'

  json_user_data = {
    :user_id => 10, 
    :user_info => {:name => 'Mr. Pusher'}
  }

  channel_name = params['channel_name']
  socket_id = params['socket_id']
  puts channel_name
  puts socket_id 
  data = Pusher[channel_name].authenticate(socket_id, json_user_data)

  content_type 'application/json'
  return data.to_json
end

post '/send_event/' do
  
  Pusher.app_id = '5420'
  Pusher.key = '4aeaafae8e422b589d9a'
  Pusher.secret = '3e63d5542aee4d876dde'
  
  event_name = params['event_name']
  channel_name = params['channel_name']
  my_data = params['data']

  puts "----"
  puts channel_name
  puts event_name
  puts my_data
  puts "----"

  Pusher[channel_name].trigger!(event_name, my_data)
  return "sent".to_json
  
end

get '/' do
  redirect "/index.html"
end