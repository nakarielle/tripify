# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
require_relative 'city_coordinates.rb'
# Stop.destroy_all
# Trip.destroy_all

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

url_length = 5

1000.times do 
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

	Trip.create(
		edit_url: edit_url,
		disp_url: disp_url)
end
