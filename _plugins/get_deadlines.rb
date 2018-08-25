require_relative 'deadline_scrapper'


module Get_Deadlines
  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      # return
      scrap_webpages_for_deadlines(site.config['deadlines'])
    end
  end
end
