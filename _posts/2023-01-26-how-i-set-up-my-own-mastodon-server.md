---
layout: default
title: Aubrie Lee
permalink: /how-i-set-up-my-own-mastodon-server
---
# How I set up my own Mastodon server and custom display name

2023.01.25
{: .centeredText .noIndent}

<br>

I was curious about Mastodon but only interested in joining if I could have the name I wanted: [@Aubrie@aubrielee.com](https://verse.aubrielee.com/@Aubrie). The promise of open source is control and customizability, is it not?

I already had a personal website at aubrielee.com hosted on GitHub Pages. Rather than rent a new domain, I set up my own Mastodon instance on a subdomain, verse.aubrielee.com. Then, I changed my display name from Aubrie@verse.aubrielee.com to Aubrie@aubrielee.com by setting up HTTP redirects and editing my Mastodon .env file.

I’ll describe my process in more detail in case it helps anyone else.


## requirements

I wanted to:
{: .noIndent }


* Keep my GitHub Pages site going on aubrielee.com
* Host my Mastodon instance on a subdomain of aubrielee.com
* Change my display name to a custom domain (@aubrielee.com instead of @subdomain.aubrielee.com)


## process

The general stages were:
{: .noIndent }


1. Set up hosting
2. Connect my domain
3. Set up Mastodon
4. Fix my admin privileges
5. Set up a custom domain


### setting up hosting

For hosting, I chose DigitalOcean because of its reputation. Setting up my Mastodon instance required creating a new Droplet.
<br>
<br>

To create the Droplet:
{: .noIndent }


1. Create DigitalOcean account (here’s my [referral link](https://m.do.co/c/d0e6256f5707) if you care to use it).
2. Begin a new Droplet.
3. Choose a region and datacenter.
4. Go to Marketplace, search for Mastodon, and choose it.
    <img src='/media/mastodon_marketplace.png' alt='Search result for mastodon returns Mastodon 4.0.2 on Ubuntu 20.04' class='listImage'>
5. Choose size. I chose the most basic option, as I’ll be the only user on my instance. For “Additional Storage”, I didn’t opt in.
6. Choose authentication method. I read Mastodon requires SSH, not password. I set up an SSH key on my Mac via Terminal.
7. For the final settings, I opted into monitoring but not backups. I didn’t change the hostname or project from the defaults.
8. Choose **Create Droplet**. The Droplet will take a few minutes to be ready.

### linking a subdomain

I had aubrielee.com and wanted to set up on verse.aubrielee.com rather than rent another domain and fragment my domain architecture. This guide assumes you already have a domain—e.g., **something.com**—and you want to set up your Mastodon server on a subdomain—e.g., **social.something.com**.

<ol start='9'>
  <li>Go to your domain name provider or registrar. Mine is Google Domains.</li>
  <li>Find your DNS settings and resource records.</li>
  <li>Create a new record A record for social.something.com. Set type to A and host name to your chosen subdomain—e.g., just <b>social</b>. I didn’t change the default TTL.</li>
  <li>Go back to DigitalOcean. When your Droplet is ready, copy its IP address.</li>
  <li>Paste the IP address into the A record.</li>
</ol>


### going through the mastodon setup wizard

Now that I had the Droplet and domain connected, I could go through the setup of the Mastodon app on the Droplet.

<ol start='14' class='lineWrap'>
  <li>Open a command line. For me, this was via Terminal on Mac.</li>
  <li>SSH into the Droplet by typing <b>ssh root@<em>[your Droplet’s IP address]</em></b> and hitting enter. Example results:
    <pre class="commandLine">Users-iMac:~ user$ <b>ssh root@##.###.###.###</b>
The authenticity of host '##.###.###.### (##.###.###.###)' can't be established.
ECDSA key fingerprint is […].
Are you sure you want to continue connecting (yes/no)? <b>yes</b>
Warning: Permanently added ##.###.###.###' (ECDSA) to the list of known hosts.
Enter passphrase for key '/Users/user/.ssh/id_rsa':
</pre>
  </li>
  <li>Enter your SSH passphrase.</li>
  <li>Go through the wizard. For example:
    <pre>Welcome to the Mastodon first-time setup!
Domain name: <b>social.something.com</b>
Do you want to store user-uploaded files on the cloud? <b>No</b>
</pre>
  </li>
  <li>Set up SMTP if you’d like. I skipped it (I actually tried a test email to see what would happen; it failed):
    <pre>
        SMTP server: <b>localhost</b>
        SMTP port: <b>587</b>
        SMTP username:
        SMTP password:
        SMTP authentication: <b>plain</b>
        SMTP OpenSSL verify mode: <b>none</b>
        E-mail address to send e-mails "from": <b>Mastodon &lt;notifications@social.something.com&gt;</b>
        Send a test e-mail with this configuration right now? <b>no</b>
    </pre>
  </li>
  <li>Create an admin account. For example:
    <pre>It is time to create an admin account that you'll be able to use from the browser!
Username: <b>Name</b>
E-mail: <b>name@something.com</b>
You can login with the password: […]
The web interface should be momentarily accessible via https://social.something.com/
</pre>
  </li>
  <li>Save that password somewhere.</li>
  <li>Go through the final SSL notification items: enter an email address and choose whether to donate to EFF. When SSL and symlinks are ready, the wizard will say <b>Setup is complete! Login at https://social.something.com</b>.</li>
  <li>Visit your social.something.com and log in with the email and password from action 19.</li>
  <li>You can set a password different from the generated one.</li>
  <li>Go to Preferences and verify you have Administration privileges. You can also verify you can visit <a href="https:/social.something.com/admin/dashboard" class='lineWrap'>https:/social.something.com/admin/dashboard</a> without error:
  <img src='/media/mastodon_admin.png' alt='Administration tab underneath Moderation tab' class='listImage'>
  </li>
</ol>

### fixing my admin privileges

When I logged into my instance, I didn’t have an Administration tab. I changed my account role to Owner by entering my Mastodon instance via Terminal and using a tootctl command.

Instead of using Terminal, you can also use the console in DigitalOcean near the top right of the web interface of your Droplet. This console is now my preferred way of entering my instance, rather than SSHing in on my computer.

<ol start='25'>
  <li>Install Ruby at the Droplet root. I’m not sure if this was necessary, but I was following a <a href="https://github.com/mastodon/mastodon/discussions/18137">GitHub thread</a>.
    <pre>root@hostname:~# <b>apt install ruby ruby-bundler</b></pre>
  </li>
  <li>Sudo into the Mastodon app.
    <pre>root@hostname:~# <b>sudo su mastodon</b></pre>
  </li>
  <li>Change to the home directory, then to the live/bin directory.
    <pre>mastodon@hostname:/root$ <b>cd ~</b>
mastodon@hostname:~$ <b>cd live/bin/</b>
</pre>
  </li>
  <li>Use tootctl to change the role of your Name account to Owner. (You set Name in action 19.)
    <pre>mastodon@hostname:~/live/bin$ <b>RAILS_ENV=production ./tootctl accounts modify Name --role Owner</b></pre>
  </li>
</ol>

Now you should have full admin privileges.
{: .noIndent }

### setting up a custom domain

Setting up a custom domain allows your display name to be **@Name@something.com** instead of **@Name@social.something.com**. (I believe, theoretically, the display domain could be arbitrary, e.g., @Name@anythingelse.com.) To display a custom domain, I set HTML redirects in GitHub Pages for three web resources: host-meta, nodeinfo, and webfinger. I also had to edit my Mastodon .env file.

<ol start='29' class='lineWrap'>
  <li>
    Curl host-meta from social.something.com

    <pre>Users-iMac:~ user$ <b>curl -k https://social.something.com/.well-known/host-meta</b></pre>
  </li>
  <li>
    Copy the resulting XML and put it in a new GitHub Pages file called:

    <pre>githubpagesusername.github.io/<b>.well-known/host-meta</b></pre>
  </li>
  <li>
    Do the same for nodeinfo. Curl nodeinfo from social.something.com

    <pre>Users-iMac:~ user$ <b>curl -k https://social.something.com/.well-known/nodeinfo</b></pre>
  </li>
  <li>
    Copy the resulting JSON and put it in a new GitHub Pages file called:

    <pre>githubpagesusername.github.io/<b>.well-known/nodeinfo</b></pre>
  </li>
  <li>
    Do the same for webfinger, curling and inserting into a file.

    <pre>Users-iMac:~ user$ <b>curl -k https://social.something.com/.well-known/webfinger?resource=acct:name@social.something.com</b></pre>

    <pre>githubpagesusername.github.io/<b>.well-known/webfinger</b></pre>
  </li>
  <li>
    In your Mastodon instance, change to the /home/mastodon/live directory:

    <pre>mastodon@hostname:~$ <b>cd /home/mastodon/live</b></pre>
  </li>
  <li>
    Edit the .env.production file with a text editor like vim or nano:

    <pre>mastodon@hostname:~/live$ <b>vim .env.production</b></pre>
  </li>
  <li>
    Add this to the top of the file, as specified by Mastodon documentation, and write the file.

    <pre><b>LOCAL_DOMAIN=something.com
WEB_DOMAIN=social.something.com</b>
</pre>
  </li>
  <li>
    Exit back to the root. If you don’t, as I didn’t at first, you’ll be asked for a password until you get “3 incorrect password attempts” when trying the next sudo actions.

    <pre>mastodon@hostname:~/live$ <b>exit</b></pre>
  </li>
  <li>
    Restart Mastodon services with these commands:

    <pre>root@hostname:~# <b>systemctl restart mastodon-web</b>
root@hostname:~# <b>systemctl restart mastodon-streaming</b>
root@hostname:~# <b>systemctl restart mastodon-sidekiq</b>
</pre>
  </li>
</ol>

Now everything should be ready! Post, boost, follow at will. Follow me, even: [https://verse.aubrielee.com/@Aubrie](https://verse.aubrielee.com/@Aubrie).
{: .noIndent }
<br>

Thank you to the people who saved me with their advice. Here are some resources I consulted along the way:

* [No one can find my account even via profile URL · Discussion #23047 · mastodon/mastodon · GitHub](https://github.com/mastodon/mastodon/discussions/23047) 
* [Setting up a Mastodon Server at DigitalOcean](https://300m.com/privacy/setting-up-a-mastodon-server-at-digitalocean/) 
* [How to Set Up Your Own Mastodon Instance](https://www.freecodecamp.org/news/how-to-set-up-your-own-mastodon-instance/) 
* [Admin CLI doesn't work out of the box for 1-click Digital Ocean installs · Discussion #18137 · mastodon/mastodon · GitHub](https://github.com/mastodon/mastodon/discussions/18137) 
* [Mastodon usernames different from the domain used for installation - Masto.host](https://masto.host/mastodon-usernames-different-from-the-domain-used-for-installation/) 
* [Configuring your environment - Mastodon documentation](https://docs.joinmastodon.org/admin/config/#federation) 
* [mastodon-documentation/Serving_a_different_domain.md at master](https://github.com/felx/mastodon-documentation/blob/master/Running-Mastodon/Serving_a_different_domain.md) 
{: .lineWrap}
