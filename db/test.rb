def url_exist?(url)
	if !!Trip.find_by(edit_url: url) || !!Trip.find_by(disp_url: url)
		return true
	else 
		return false
	end
end