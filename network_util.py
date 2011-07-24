#!/usr/bin/python
# -*- coding: utf8 -*-

"""

"""
import urllib, urllib2
import htmlentitydefs

def _open_site(url):
    site = urllib2.urlopen(url)
    return site

def urlopen(url):
    site = _open_site(url)
    text = site.read()
    encoding = get_encoding_from_header(site.headers)
    return text.decode(encoding)


def get_encoding_from_header(header=None, url=None):
    if header is None:
        site = _open_site(url)
        header = site.headers
    ct = header.dict['content-type'].strip()
    param = ct.split(';', 1)[1].strip()
    encoding = param.partition('charset=')[2]
    return encoding

def get_filename_from_header(header=None, url=None):
    if header is None:
        site = _open_site(url)
        header = site.headers
    try:
        cd = header.dict['content-disposition'].strip()
        param = cd.split(';', 1)[1].strip()
        filename = param.partition('filename=')[2].strip('"')
        return filename
    except:
        raise Exception("parse error")


def get_domain(url, path=None):
    '''
        urlparse:
            <scheme>://<netloc>/<path>;<params>?<query>#<fragment>
    '''
    parse_result = urllib2.urlparse.urlparse(url)
    domain = '''%(scheme)s://%(netloc)s''' % parse_result._asdict()
    domain = domain.rstrip('/')

    # paste path if any
    if path:
        return domain + "/" + unescape(path).lstrip('/')

    return domain


def unescape(text, repeat=None):
    ''' from http://effbot.org/zone/re-sub.htm#unescape-html '''
    def fixup(m):
        text = m.group(0)
        if text[:2] == "&#":
            # character reference
            try:
                if text[:3] == "&#x":
                    return unichr(int(text[3:-1], 16))
                else:
                    return unichr(int(text[2:-1]))
            except ValueError:
                pass
        else:
            # named entity
            try:
                text = unichr(htmlentitydefs.name2codepoint[text[1:-1]])
            except KeyError:
                pass
        return text # leave as is
    new_text = re.sub("&#?\w+;", fixup, text)

    # once
    if repeat is None:
        return new_text

    # repeat for specified times, until no change
    repeat_count = 0
    while new_text != text:
        text = new_text
        new_text = re.sub("&#?\w+;", fixup, text)

        repeat_count += 1
        if repeat is True: 
            continue
        elif repeat_count >= repeat:
            break

    return new_text


# vim: sts=4 et
