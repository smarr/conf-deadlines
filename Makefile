install:
	bundler3.4 config set --local path vendor/bundle
	bundler3.4 install

build:
	bundler3.4 exec jekyll build --future true -d docs

serve:
	bundler3.4 exec jekyll serve --config _config.yml,_config_local.yml  -d docs
