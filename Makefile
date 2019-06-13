build:
	bundle-2.5 exec jekyll build --future true -d docs

serve:
	bundle-2.5 exec jekyll serve --config _config.yml,_config_local.yml  -d docs
