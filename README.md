# SMO

Simualtion model of handling source requests using devices and buffers

# Logic

Sources generate requests randomly
If there are free devices - request goes to the prioritized one
If there are no free devices, but there are free buffers - request goes to the prioritized buffer
If there are no free devices or buffers - request goes to the buffer as queue, old request gets rejected

# Main goal

Find the optimal failover modification of sources, buffers and devices
