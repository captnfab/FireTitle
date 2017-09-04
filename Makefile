.PHONY: all firetitle.xpi

all: firetitle.xpi

firetitle.xpi:
	zip -r --exclude '*.swp' --exclude Makefile --exclude '*.xpi' -FS firetitle.xpi *
