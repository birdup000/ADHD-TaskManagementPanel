# ADHD-TaskManagementPanel (Still in Development)
Task management fundamentally ensures focused work, better time usage and less procrastination, while aiding memory, boosting efficiency, promoting deadline adherence, tracking goal progression and reducing stress. It's a universal tool beneficial for all, including those with ADHD and without. Also Mental health is important in general so that is why I decided to make this application as it would be a game changer in helping everyone overall and you'll be able to see the code so you know what is running yay for open-source!!

# Plans

I plan to create a Android App to also interact with the interface to communicate with a custom backend for managing the tasks list. As of right now the task list isn't presistant so if you wanna leave the page and go back all of your saved entries will be gone so having a backend to store within a db or local using json while also having the ability to import task lists to different instnaces. Multi-user Support will be added so that will include authentication additions, Google Calender and Microsoft Office 365 (Outlook Calender) Calender Integrations so when you set a task due date and or Reminder it will show up on one or both if linked. This is really the idea of how I plan it to function but if anyone wants to make a issues request for ideas you are very welcome to do so 😄 and is much appreciated for that! If you have questions feel free to reach me in the issues but please tag the title with [QUESTION] and will respond to your question as quickly as possible.

The following in the list below are features for sure are gonna be added.

- [x] Backend (Still in development)
- [x] Web Interface (Still in development)
- [x] Android App (Still in development
- [X] Login Page (Overall Still in Development and progress for this is inside Authentication Branch)
         - Multi-User Support (Still in Development)
         - Google Auth for login and Microsoft Auth for login (Not Added Yet)
- [x] Import Task list (Yes if you move the json file from each server from the backend. Will add to web interface soon!)  
- [ ] DB Support
- [ ] AI integration (Coming Soon! To enhance productivity and help keep you focused),(Unofficial apis support /v1/chat/completion)
- [x] Google Calander Integrations (Still in development/Rethinking OAuth Implementation [Replacing Current addition])
- [ ] Microsoft Office 365 Calender (Outlook Calender)
- [X] Docker Support /w docker compose (Still in Development. Frontend Working, Backend Broken)
- [ ] Docker Support /w docker image on dockerhub

# Plans Extra 
I plan to have the Android app self compile or I could take into consideration of having a part where you would enter the api keys from your Google and or Microsoft Accounts so that the integrations would work which would mean compiled (apk/xapk).

# Q/A
1.Why are you very committed into making this project succesful?
I'm commited because as an individual have ADHD and its hard to focus in general also tis why progress in the project may be slow. 


# Setup Instructions

* You'll need a machine that can run Nodejs preferably capable of running the latest stable version of Nodejs with NPM, Git, x64 or x86 machine (I have not tested this project on a arm64, or arm7 machine)
* At least 1gb (possibly less can run this project not tested) of available ram is required to run this project
* As of now the project size with all of the packages installed is exactly 268.9 MB and can get bigger overtime. I recommend at least 1gb of storage space for this project even though its less than that amount only for wiggle room incase the project size increases.

To start you'll want to clone the repo using "git clone https://github.com/greengeckowizard/ADHD-TaskManagementPanel" then you'll wanna cd into the directory by using "cd ADHD-TaskManagementPanel" when you're in the directory now you'll need to hop into the actual project directory for the web instance which is adhdpanel so type "cd adhdpanel". Now you'll need to install the prerequisite packages so type npm install and to run the panel you'll need to type "npm start" however it will not start the backend, so you'll need to open a new terminal instance in your ssh or local term to start the backend which can be ran from inside the backend directory using the "node main" command which will run on port 5000.

# Screenshots of Task Management Page

![Screenshot from 2023-10-16 22-18-41](https://github.com/greengeckowizard/ADHD-TaskManagementPanel/assets/34012548/37341794-4969-4a7b-8d90-6c62b623fed4)

# Screenshots of Timer Page

![2023-10-27_21-22](https://github.com/greengeckowizard/ADHD-TaskManagementPanel/assets/34012548/35137b59-d82c-45d8-8d85-8d51a943a4ca)
