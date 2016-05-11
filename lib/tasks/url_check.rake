	desc 'checking if url exist in Db'
	task trip_count: [:environment] do

		puts Trip.count
	end

