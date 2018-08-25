return


require 'test/unit'
require 'yaml'
require_relative 'deadline_scrapper'

class ScrapperTest < Test::Unit::TestCase

  def initialize(test_case_class)
    super
    data = YAML.load_file('../_config.yml')
    @data = data['deadlines']
  end

  # Called before every test method runs. Can be used
  # to set up fixture information.
  def setup
    # Do nothing
  end

  # Called after every test method runs. Can be used to tear
  # down fixture information.

  def teardown
    # Do nothing
  end

  def test_process_events
    data = process_events(@data['events'])
    puts data
  end


  def test_get_dates_for_latest
    dates = get_dates_for_latest('https://conf.researchr.org/series/ICOOOLPS')
    puts dates

    fail('Not implemented')
  end

  def test_get_dates_for_VEE
    dates = get_dates_from_event('https://conf.researchr.org/track/vee-2019/vee-2019-papers')

    assert dates.length >= 2
    first = dates[0]

    assert_not_nil first[:date]
    assert first[:title].length >= 0
  end
end