How to setup.

  1 git clone https://github.com/UzairAJ1/backend-solution.git
  
  2 npm install
  
  3 create the env according to the .env.example
  
  4 npx prisma migrate dev
  
  5 npm start

Testing Api's with postman.

1) GET: http://localhost:3333/ for index

2) POST: http://localhost:3333/api/auth/register to resiter user,make sure to add username, email, password, role in request. As I have implemented User Admin role, so you will have to describe with enum Admin or User.
   example: {"username":"sdaa2d","email": "test2","password":"123","role":"Admin"}

3)  POST: http://localhost:3333/api/auth/login to login the user, example:{ "email": "test2", "password":"123",}, when the user is logged in, it generates a token, copy that and paste it in headers with key :"authorization" and value: "Bearer tokenxyz" so the user will be validated for other required endpoints.

4) GET: http://localhost:3333/api/auth to see all users, note: the user has to be Admin to see all other users. so try to register a user with role "Admin" first then send the token in header to validate .

5) GET: http://localhost:3333/api/auth/profile to get the user's details when authorized which includes the projects and tasks he is assigned with.

6) GET: http://localhost:3333/api/auth/search-projects to search for items in the projects where user is added with. so for that go to Params add key :"searchTerm" and the value:"test" note:you can change value, this finds the project where the name or description contains the value.

7) GET: http://localhost:3333/api/auth/search-tasks to search for items in the tasks where user is added with. so for that go to Params add key :"searchTerm" and the value:"test" note:you can change value, this finds the task where the name or description contains the value.


8) GET: http://localhost:3333/api/projects to find all the projects where the user is associated with after validation.

9) POST: http://localhost:3333/api/projects to create a project, if the user logged in is Admin only then he can create projects for other users, if user is regular user then he only only create a project for himself, req example:{"name":"test","description":"test","userIds":[1,2]}

10)GET : http://localhost:3333/api/projects/3 to find project by Id, 3 is Id for example.in this api, if regular user is associated in that project only then he may be able to see, if user is Admin then can see any project.

11)PUT: http://localhost:3333/api/projects/3 to edit the existing project.only the user associated or admin can change this, req example:{ "name":"test", "description":"test"} this is according to the requirement.

12)DELETE: http://localhost:3333/api/projects/3 to delete the project, only authorized users can delete thier project.


13)POST: http://localhost:3333/api/projects/1/tasks to create a task, only the users associated in the project for which the task is being created can create it or the admins.example req:{"title":"test","description":"test","userId":1,"dueDate": "2024-03-10"}

14)GET: http://localhost:3333/api/projects/:projectId/tasks to get all tasks for authorized user.

15)GET: http://localhost:3333/api/tasks/:taskId to get single task for authorized user.

16)PUT: http://localhost:3333/api/tasks/:taskId to edit the task for authorized user. example:{"title":"test","description":"test","dueDate": "2024-03-10","completed":true}

17)DELETE: http://localhost:3333/api/tasks/:taskId to delete task if authorized.

18)POST: http://localhost:3333/api/projects/tasks/assign to assign a task to a user, in this I have added a validtion so the user have to be in the same project. example"{"projectId":1,"taskId":1,"userId":2}

19)POST http://localhost:3333/api/projects/tasks/unassign to unassign a task to a person in that project.example :{"projectId":1,"taskId":1}

20)POST http://localhost:3333/api/upload/:taskId to upload file for a task, only the user who has been assigned the task will be able to upload the file. for that go to form-data to send a request. then in key write "file" and for value select a file. note: choose to select the file not text.

21)GET http://localhost:3333/api/retrieve/:taskId to get the files which are uploaded.

22)DELETE http://localhost:3333/api/delete/:fileId to delte the file uploaded, you have to set the id of file in paramter.

23)Socket.IO, to test that you have to clone this react app :https://github.com/UzairAJ1/socket-test-react.git then run this, when you start this you will get connected to socket, so i have only implemented this in createTask api, when you log in in postman 
get the userId and paste it in react app where the user is define, so whenever a task will be created for that user in backend the client app will get a message that task created for you.
make sure the react app is running on port 3000 and backend is running on 3333
