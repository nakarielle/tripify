class CreateStops < ActiveRecord::Migration
  def change
    create_table :stops do |t|
      t.string :name
      t.float :lat
      t.float :lng
      t.float :trip_id

      t.timestamps null: false
    end
  end
end
