.PHONY: all firetitle-crappy.zip firetitle-xul.xpi
POFILES=$(wildcard firetitle-pot/*/*.po)
LOFILES=$(wildcard firetitle/_locales/*/*.json)

all: firetitle-crappy.zip firetitle-xul.xpi

firetitle-crappy.zip:
	cd firetitle/;zip -r --exclude '*.swp' -FS ../firetitle-crappy.zip *
firetitle-xul.xpi:
	cd old-xul/; zip -r --exclude '*.swp' -FS ../firetitle-xul.zip *
	mv firetitle-xul.zip firetitle-xul.xpi

firetitle-crappy-lang-import: $(patsubst firetitle-pot%.po,firetitle/_locales%.json,$(POFILES))
firetitle-crappy-lang-export: $(patsubst firetitle/_locales%.json,firetitle-pot%.po,$(LOFILES))

firetitle/_locales/%.json:
	mkdir -p $(dir $@)
	./update_locales.py $(patsubst firetitle/_locales%.json,firetitle-pot%.po,$@) firetitle/_locales/en/messages.json $@

firetitle-pot/%.po:
	mkdir -p $(dir $@)
	json2po --duplicate merge -t firetitle/_locales/en/messages.json -i $(patsubst firetitle-pot%.po,firetitle/_locales%.json,$@) -o $@
