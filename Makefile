build:
	bundle-2.4 exec jekyll build --future true

serve:
	bundle-2.4 exec jekyll serve --config _config.yml,_config_local.yml
