.PHONY: all crappy-firetitle.zip

POFILES=$(wildcard _locales/*/*.po)
LOFILES=$(wildcard _locales/*/*.json)

all: crappy-firetitle.zip

crappy-firetitle.zip:
	zip -r --exclude '*.swp' --exclude '*.po' --exclude '*.zip' --exclude '*.md' --exclude 'res/' --exclude 'Makefile' -FS crappy-firetitle.zip *

lang-import: $(POFILES:.po=.json)
lang-export: $(LOFILES:.json=.po)

%.json:
	./update_locales.py $(@:.json=.po) _locales/en/messages.json $@

%.po:
	json2po --duplicate merge -t _locales/en/messages.json -i $(@:.po=.json) -o $@
