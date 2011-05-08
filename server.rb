#!/usr/bin/env ruby
require 'webrick'
require 'optparse'
require 'rubygems'
require 'pusher'
require 'json'

include WEBrick    # let's import the namespace so
                   # I don't have to keep typing
                   # WEBrick:: in this documentation.




class Simple < WEBrick::HTTPServlet::AbstractServlet

 def do_POST(request, response)
   status, content_type = do_stuff_with(request)

   Pusher.app_id = '5420'
   Pusher.key = '4aeaafae8e422b589d9a'
   Pusher.secret = '3e63d5542aee4d876dde'
   
   json_user_data = {
     :user_id => 10, 
     :user_info => {:name => 'Mr. Pusher'}
   }

   response.status = status
   response['Content-Type'] = content_type
  
   puts request.query['channel_name']
   puts request.query['socket_id']
   data = Pusher[request.query['channel_name']].authenticate(request.query['socket_id'], json_user_data)
   response.body = data.to_json
 end

 def do_stuff_with(request)
   return 200, "application/json"
 end

end

options = {:Port=>8080, :DocumentRoot=> './'}
 
optparser=OptionParser.new do |opts|
    opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
    opts.on("-p", "--port port_num", "Specify Port Number") do |v|
        options[:Port]=v
    end
    opts.on("-d", "--docroot path", "Specify Document Root Folder") do |v|
        options[:DocumentRoot]=v
    end
end
 
def start_webrick(config = {})
  # always listen on port 8080
  server = HTTPServer.new(config)
  yield server if block_given?
  ['INT', 'TERM'].each {|signal|
    trap(signal) {server.shutdown}
  }
  server.mount "/pusher/auth", Simple
  server.start
end
 
begin
  optparser.parse!(ARGV)
  start_webrick(options)
rescue Exception=>e
  puts optparser.to_s
end