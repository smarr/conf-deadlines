require 'net/http'
require 'nokogiri'
require 'date'
require 'json'

module Get_Deadlines
  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      data_filename = site.config['deadlines']['data_file']
      series        = site.config['deadlines']['series']
      calls         = site.config['deadlines']['calls']

      data = []

      if series
        for name, url in series do
          data << {
              :name  => name,
              :dates => get_dates_for_latest(url) }
        end
      end

      if calls
        for name, url in calls do
          data << {
              :name => name,
              :dates => get_dates_from_event(url) }
        end
      end

      write_to_file(data, data_filename)
    end

    def get_dates_for_latest(series_url)
      uri     = URI(series_url)
      content = Net::HTTP.get(uri)

      page    = Nokogiri::HTML(content)
      links   = page.css('.edition-row h3 > a')

      for l in links do
        event_url = l['href']
        dates     = get_dates_from_event(event_url)

        if !dates.empty?
          return {:url   => event_url,
                  :dates => dates}
        end
      end
    end

    def get_dates_from_event(event_url)
      uri     = URI(event_url)
      content = Net::HTTP.get(uri)
      page    = Nokogiri::HTML(content)

      dates_elements = page.css('.important-dates-in-sidebar td')

      dates = []
      # puts event_url

      for d in dates_elements do
        # puts d.text
        if d.text.include? "All important dates"
          next
        end

        date = d.children[0].text
        title = d.children[2].text
        if not title
          title = d.children[3].text
        end

        dates << {:date  => Date.parse(date),
                  :title => title}
      end

      dates
    end

    def write_to_file(data, name)
      # puts "Write to #{name}"
      File.write(name, JSON.generate(data))
    end
  end
end

