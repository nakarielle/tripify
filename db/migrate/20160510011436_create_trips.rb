class CreateTrips < ActiveRecord::Migration
  def change
    create_table :trips do |t|
      t.string :edit_url
      t.string :disp_url

      t.timestamps null: false
    end
  end
end
