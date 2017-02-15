# pm2-mqtt
PM2 Module to monitor MQTT broker on the $SYS, Currently works with Mosquitto and tested with Mosquitto only.
More work to be done, stay posted and it would be great to get contributions on this by interest. 

####Install 
`pm2 install pm2-mqtt`

####Configure   
`pm2 set pm2-mqtt:host mqtt://{your host}`  
`pm2 set pm2-mqtt:username {USERNAME}`  
`pm2 set pm2-mqtt:password {PASSWORD}`

####Restart  
`pm2 restart pm2-mqtt`


###TODO
 - Support for MQTT TLS 
 - Monitor topics by configuration to support ALL mqtt brokers 
 - MQTT broker topic presets and configurations 