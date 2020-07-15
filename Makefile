install:
	bundle2.7 install

build:
	bundle2.7 exec jekyll build --future true -d docs

serve:
	bundle2.7 exec jekyll serve --config _config.yml,_config_local.yml  -d docs
