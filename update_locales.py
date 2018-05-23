#!/usr/bin/env python3
import sys
import polib

if __name__=="__main__":
    filename_po=sys.argv[1]
    filename_template=sys.argv[2]
    filename_output=sys.argv[3]

    file_po = polib.pofile(filename_po, encoding='utf-8')
    lines=[]
    with open(filename_template) as file_template:
        for line in file_template:
            for entry in file_po:
                line = line.replace(entry.msgid, entry.msgstr)
            lines.append(line)
    with open(filename_output,'w') as file_output:
        for line in lines:
            file_output.write(line)
