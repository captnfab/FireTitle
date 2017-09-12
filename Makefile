.PHONY: all firetitle-crappy.zip firetitle-xul.xpi

all: firetitle-crappy.zip firetitle-xul.xpi

firetitle-crappy.zip:
	cd firetitle/;zip -r --exclude '*.swp' -FS ../firetitle-crappy.zip *
firetitle-xul.xpi:
	cd old-xul/; zip -r --exclude '*.swp' -FS ../firetitle-xul.zip *
	mv firetitle-xul.zip firetitle-xul.xpi
