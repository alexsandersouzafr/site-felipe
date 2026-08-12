# 02 — Schedule data slice

**What to build:** An end-to-end event data path that lets the conductor manage concerts with their local timezone and lets public reads return only visible events in the correct chronological order.

**Blocked by:** 01 — Content foundation.

**Status:** resolved

- [x] Events retain the correct local concert time from UTC and an IANA timezone.
- [x] Draft and future-scheduled events are absent from public schedule reads.
- [x] Event data contains the venue, city, country, optional ticket link, and date range.
