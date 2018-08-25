require 'net/http'
require 'nokogiri'
require 'date'
require 'json'

def add_date(dates, event, key)
  if event[key]
    dates << { :date => event[key],
               :title => key }
  end
end

def process_events(events)
  data = []

  for name, event in events do
    if event['series']
      dates = get_dates_for_latest(event['series'])
      dates[:name] = name
      dates[:rank] = event['rank']
      data << dates
    elsif event['call']
      data << {
          :name => name,
          :rank => event['rank'],
          :url => event['call'],
          :dates => get_dates_from_event(event['call']) }
    else
      dates = []
      add_date(dates, event, 'Abstract')
      add_date(dates, event, 'Paper')
      add_date(dates, event, 'Notification')
      add_date(dates, event, 'Camera Ready')
      add_date(dates, event, 'Event')

      data << {
          :name => name,
          :url => event['url'],
          :rank => event['rank'],
          :dates => dates }
    end
  end

  data
end

def scrap_webpages_for_deadlines(deadlines)
  data_filename = deadlines['data_file']
  events        = deadlines['events']

  data = process_events(events)

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

  {}
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
    if not title or title == ""
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
