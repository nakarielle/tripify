# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
require_relative 'city_coordinates.rb'
Stop.destroy_all
Trip.destroy_all

# Length of url, 52521875 possible Url for a length of 5
url_length = 5

def gen_url(length)
	rand(36**length).to_s(36)
end

def url_exist?(url)
	if !!Trip.find_by(edit_url: url) || !!Trip.find_by(disp_url: url)
		return true
	else 
		return false
	end
end

# 
20.times do 
	edit_url = gen_url(url_length)

	while url_exist?(edit_url) do 
		puts "same edit_url found on #{edit_url}"
		edit_url = gen_url(url_length)
	end

	disp_url = gen_url(url_length)

	while url_exist?(disp_url) do 
		puts "same disp_url found on #{disp_url}"
		disp_url = gen_url(url_length)
	end

	Trip.create(edit_url: edit_url, disp_url: disp_url)
end

Trip.all.each { |trip|
	puts "creating stop on trip id : #{trip.id}"


	(3..10).to_a.sample.times do
		random_stop = @city.sample
		puts random_stop
		Stop.create(name: random_stop["name"],
					lat: random_stop["lat"],
					lng: random_stop["lng"],
					trip_id: trip.id,
					arrived_at: Time.now - rand(86400..(86400*10000)) )
	end
}


# 86400 one day









