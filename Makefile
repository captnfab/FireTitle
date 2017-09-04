.PHONY: all

all: crappy.zip

crappy.zip:
	cd firetitle/;zip -r --exclude '*.swp' -FS ../firetitle.zip *
