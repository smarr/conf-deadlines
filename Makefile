build:
	bundle exec jekyll build --future true

serve:
	bundle exec jekyll serve --config _config.yml,_config_local.yml
