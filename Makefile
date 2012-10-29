.PHONY: FireTitle.xpi

CHROOT=

FireTitle.xpi:
	cd trunk; rm ../FireTitle.xpi; $(CHROOT) zip ../FireTitle.xpi -r * -x \*.svn\*; cd ..
#	cd trunk/chrome/; rm firetitle.jar; $(CHROOT) zip firetitle.jar -r *; cd ../..
