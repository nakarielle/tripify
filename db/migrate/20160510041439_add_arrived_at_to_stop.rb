#following bash command will generate this file
#rails generate migration AddArrivedAtToStop arrived_at:date
class AddArrivedAtToStop < ActiveRecord::Migration
  def change
    add_column :stops, :arrived_at, :date
  end
end
