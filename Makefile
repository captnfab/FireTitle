.PHONY: FireTitle.xpi

FireTitle.xpi: clean
	cd src && ($(CHROOT) zip ../FireTitle.xpi -r *; cd ..)

clean:
	rm -f FireTitle.xpi
