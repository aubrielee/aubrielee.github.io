---
layout: default
title: Aubrie Lee
---
# How I set up my own Mastodon server and custom display name

I was curious about Mastodon but only interested in joining if I could have the name I wanted: @Aubrie@aubrielee.com. The promise of open source is control and customizability, is it not?

I already had a personal website at aubrielee.com hosted on GitHub Pages. Rather than rent a new domain, I set up my own Mastodon instance on a subdomain, verse.aubrielee.com. Then, I changed my display name from Aubrie@verse.aubrielee.com to Aubrie@aubrielee.com by setting up HTTP redirects and editing my Mastodon .env file.

I’ll describe my process in more detail in case it helps anyone else.


## Requirements

I wanted to:



* Keep my GitHub Pages site going on aubrielee.com
* Host my Mastodon instance on a subdomain of aubrielee.com
* Change my display name to a custom domain (@aubrielee.com instead of @subdomain.aubrielee.com)


## Process

The general stages were:



1. Set up hosting
2. Connect my domain
3. Set up Mastodon
4. Fix my admin privileges
5. Set up a custom domain


### Setting up hosting

For hosting, I chose DigitalOcean because of its reputation. Setting up my Mastodon instance required creating a new Droplet.

To create the Droplet:



1. Create DigitalOcean account (here’s my [referral link](https://m.do.co/c/d0e6256f5707) if you care to use it)
2. Begin a new Droplet.
3. Choose a region and datacenter.
4. Go to Marketplace, search for Mastodon, and choose it.




![alt_text](images/image1.png "image_tooltip")




5. Choose size. I chose the most basic option, as I’ll be the only user on my instance. For “Additional Storage”, I didn’t opt in.
6. Choose authentication method. I read Mastodon requires SSH, not password. I set up an SSH key on my Mac via Terminal.
7. For the final settings, I opted into monitoring but not backups. I didn’t change the hostname or project from the defaults.
8. Choose **Create Droplet**.

The Droplet will take a few minutes to be ready.


### Linking a subdomain

I had aubrielee.com and wanted to set up on verse.aubrielee.com rather than rent another domain and fragment my domain architecture. This guide assumes you already have a domain—e.g., **something.com**—and you want to set up your Mastodon server on a subdomain—e.g., **social.something.com**.



9. Go to your domain name provider or registrar. Mine is Google Domains.
10. Find your DNS settings and resource records.
11. Create a new record A record for social.something.com. Set type to A and host name to your chosen subdomain—e.g., just **social**. I didn’t change the default TTL.
12. Go back to DigitalOcean. When your Droplet is ready, copy its IP address.
13. Paste the IP address into the A record.


### Going through the Mastodon setup wizard

Now that I had the Droplet and domain connected, I could go through the setup of the Mastodon app on the Droplet.



14. Open a command line. For me, this was via Terminal on Mac.
15. SSH into the Droplet by typing **ssh root@_[your Droplet’s IP address]_** and hitting enter. Example results:

```
Users-iMac:~ user$ **ssh root@##.###.###.###**
The authenticity of host '##.###.###.### (##.###.###.###)' can't be established.
ECDSA key fingerprint is […].
Are you sure you want to continue connecting (yes/no)? **yes**
Warning: Permanently added ##.###.###.###' (ECDSA) to the list of known hosts.
Enter passphrase for key '/Users/user/.ssh/id_rsa': 
```



16. Enter your SSH passphrase.
17. Go through the wizard. For example:

Welcome to the Mastodon first-time setup!

Domain name: **social.something.com**

Do you want to store user-uploaded files on the cloud? **No**



18. Set up SMTP if you’d like. I skipped it (I actually tried a test email to see what would happen; it failed):

SMTP server: **localhost**

SMTP port: **587**

SMTP username: 

SMTP password: 

SMTP authentication: **plain**

SMTP OpenSSL verify mode: **none**

E-mail address to send e-mails "from": **Mastodon &lt;notifications@social.something.com>**

Send a test e-mail with this configuration right now? **no**



19. Create an admin account. For example:

It is time to create an admin account that you'll be able to use from the browser!

Username: **Name**

E-mail: **name@something.com**

You can login with the password: […]

The web interface should be momentarily accessible via https://social.something.com/



20. Save that password somewhere.
21. Go through the final SSL notification items: enter an email address and choose whether to donate to EFF. When SSL and symlinks are ready, the wizard will say **Setup is complete! Login at [https://social.something.com](https://social.something.com)**.
22. Visit social.something.com and log in with the email and password from action 19.
23. You can set a password different from the generated one.
24. Go to Preferences and verify you have Administration privileges. You can also verify you can visit https:/social.something.com/admin/dashboard without error:



<p id="gdcalert2" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image2.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert3">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image2.png "image_tooltip")
 \



### Fixing my admin privileges

When I logged into my instance, I didn’t have an Administration tab. I changed my account role to Owner by entering my Mastodon instance via Terminal and using a tootctl command.

Instead of using Terminal, you can also use the console in DigitalOcean near the top right of the web interface of your Droplet. This console is now my preferred way of entering my instance, rather than SSHing in on my computer.



25. Install Ruby at the Droplet root. I’m not sure if this was necessary, but I was following a [GitHub thread](https://github.com/mastodon/mastodon/discussions/18137).

root@hostname:~# apt **install ruby ruby-bundler**



26. Sudo into the Mastodon app.

root@hostname:~# **sudo su mastodon**



27. Change to the home directory, then to the live/bin directory.

mastodon@hostname:/root$ **cd ~**

mastodon@hostname:~$ **cd live/bin/**



28. Use tootctl to change the role of your Name account to Owner. (You set Name in action 19.)

mastodon@hostname:~/live/bin$ **RAILS_ENV=production ./tootctl accounts modify Name --role Owner**

Now you should have full admin privileges.


### Setting up a custom domain

Setting up a custom domain allows your display name to be @[Name@something.com](mailto:Name@something.com) instead of @[Name@social.something.com](mailto:Name@social.something.com). (I believe, theoretically, it could also be @[Name@anythingelse.com](mailto:Name@anythingelse.com).) To display a custom domain, I set HTML redirects in GitHub Pages for three web resources: host-meta, nodeinfo, and webfinger. I also had to edit my Mastodon .env file.



29. Curl host-meta from social.something.com

Users-iMac:~ user$ **curl -k https://social.something.com/.well-known/host-meta** \




30. Copy the resulting XML and put it in a new GitHub Pages file called:

githubpagesusername.github.io/.well-known/host-meta



31. Do the same for nodeinfo. Curl nodeinfo from social.something.com

Users-iMac:~ user$ **curl -k https://social.something.com/.well-known/nodeinfo**



32. Copy the resulting JSON and put it in a new GitHub Pages file called:

githubpagesusername.github.io/.well-known/nodeinfo



33. Do the same for webfinger.

Users-iMac:~ user$ **curl -k https://social.something.com/.well-known/webfinger?resource=acct:name@social.something.com**



34. In your Mastodon instance, change to the /home/mastodon/live directory:

mastodon@hostname:~$ **cd /home/mastodon/live**



35. Edit the .env.production file with a text editor like vim or nano:

mastodon@hostname:~/live$ **vim .env.production**



36. Add this to the top of the file, as specified by Mastodon documentation, and write the file.

**LOCAL_DOMAIN=something.com**

**WEB_DOMAIN=social.something.com**



37. Exit back to the root. If you don’t, as I didn’t at first, you’ll be asked for a password until you get “3 incorrect password attempts” when trying the next sudo actions.

mastodon@hostname:~/live$ **exit**



38. Restart Mastodon services with these commands:

root@hostname:~# **systemctl restart mastodon-web**

root@hostname:~# **systemctl restart mastodon-streaming**

root@hostname:~# **systemctl restart mastodon-sidekiq**

Now everything should be ready! Post, boost, follow at will. Follow me, even: https://verse.aubrielee.com/@Aubrie.

Thank you to the people who saved me with their advice. Here are some resources I consulted along the way:

* [No one can find my account even via profile URL · Discussion #23047 · mastodon/mastodon · GitHub](https://github.com/mastodon/mastodon/discussions/23047) 
* [Setting up a Mastodon Server at DigitalOcean | Marc Kranat](https://300m.com/privacy/setting-up-a-mastodon-server-at-digitalocean/) 
* [How to Set Up Your Own Mastodon Instance](https://www.freecodecamp.org/news/how-to-set-up-your-own-mastodon-instance/) 
* [Admin CLI doesn't work out of the box for 1-click Digital Ocean installs · Discussion #18137 · mastodon/mastodon · GitHub](https://github.com/mastodon/mastodon/discussions/18137) 
* [Mastodon usernames different from the domain used for installation | Masto.host](https://masto.host/mastodon-usernames-different-from-the-domain-used-for-installation/) 
* [Configuring your environment - Mastodon documentation](https://docs.joinmastodon.org/admin/config/#federation) 
* [mastodon-documentation/Serving_a_different_domain.md at master](https://github.com/felx/mastodon-documentation/blob/master/Running-Mastodon/Serving_a_different_domain.md) 
