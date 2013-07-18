var IntervalID = 0;

//------------------------------------------------------------------------------
//
//  Retrieve the TaskArr JSON string from DOM storage, convert it into a
//  JavaScript object, and return it.  If there is no TaskArr in DOM storage, 
//  return an empty JavaScript object.
//
//------------------------------------------------------------------------------
function RetrieveTaskArr ( ) {
    var TaskArr_JSON = "",
        TaskArr = {};

    if ( localStorage.getItem("TaskArr") )
    {
        TaskArr_JSON = localStorage.getItem("TaskArr");
        TaskArr      = JSON.parse(TaskArr_JSON);
    }

    return ( TaskArr );
}

function SaveTaskArr ( TaskArr ) {
    var TaskArr_JSON = JSON.stringify(TaskArr);

    localStorage.setItem("TaskArr", TaskArr_JSON);
}

function ActivateTask ( TaskName ) {
    var TaskObj = $("#" + TaskName + ">table" );

    if ( TaskObj.hasClass("task_mouseover") )
    {
        TaskObj.removeClass( "task_mouseover" ).addClass( "task_current_mouseover" );
    }
}

function DeactivateTask ( TaskName ) {
    var TaskObj = $("#" + TaskName + ">table" );

    if ( TaskObj.hasClass("task_current_mouseover") )
    {
        TaskObj.removeClass( "task_current_mouseover" ).addClass( "task_mouseover" );
    }
    else if ( TaskObj.hasClass("task_current") )
    {
        TaskObj.removeClass( "task_current" ).addClass( "task_inactive" );
    }
}

function StartTimer ( event ) {
    var TaskName = $(this).attr("id"),
        $this    = $(this),
        Timer;

    if (IntervalID != 0)
    {
        //  Stop the currently running timer
        clearInterval( IntervalID );
        IntervalID = 0;
    }
    
    if ( $this.attr("id") == localStorage.CurrentTask )
    {
        //  User clicked on the current task.  Clear the current task, and be
        //  done.
        DeactivateTask ( localStorage.CurrentTask );
        localStorage.CurrentTask = "";

    }
    else
    {
        //
        //  User clicked on a task other than the current task.  Start the timer
        //  and record which task is the current one.
        Timer = $this.find( "#timer" );
        IntervalID = setInterval(function () {
            var TaskArr_JSON = "",
                TaskArr      = {},
                TaskTime;

            TaskArr = RetrieveTaskArr();

            TaskTime = parseInt(TaskArr[TaskName]);
            TaskTime++;
            Timer.text(TaskTime);

            TaskArr[TaskName] = TaskTime.toString();
            SaveTaskArr ( TaskArr );
        }, 1000);

        //
        //  Deactivate the previously current task, if there was one, record the
        //  new current task's name, and active the new current task.
        if ( localStorage.CurrentTask.length > 0 )
        {
            DeactivateTask ( localStorage.CurrentTask );
        }
        localStorage.CurrentTask = $this.attr("id");
        ActivateTask ( localStorage.CurrentTask );
    }
}

function RemoveTask ( event ) {
    var $this     = $(this),
        ID        = $this.attr("id"),
        TaskArr,
        TaskDelim = ID.lastIndexOf('_'),
        TaskName = ID.substring(0,TaskDelim);

    //
    //  Remove the Task from DOM storage.
    TaskArr = RetrieveTaskArr();
    delete TaskArr[TaskName];
    SaveTaskArr( TaskArr );

    if ( localStorage.CurrentTask == TaskName )
    {
        //
        //  If the task we're removing is the CurrentTask,
        //  stop the timer and clear the related IntervalID.
        clearInterval( IntervalID );
        IntervalID = 0;
        localStorage.CurrentTask = "";
    }

    //
    //  By removing the parent DIV, we remove the entire task from the DOM.
    $this.parent().remove();
}

function MouseEnterTask ( event ) {
    var $this = $(this);

    if ( $this.hasClass("task_inactive") )
    {
        $this.removeClass( "task_inactive" ).addClass( "task_mouseover" );
    }
    else if ( $this.hasClass("task_current") )
    {
        $this.removeClass( "task_current" ).addClass( "task_current_mouseover" );
    }
}

function MouseLeaveTask ( event ) {
    var $this = $(this);

    if ( $this.hasClass("task_mouseover") )
    {
        $this.removeClass( "task_mouseover" ).addClass( "task_inactive" );
    }
    else if ( $this.hasClass("task_current_mouseover") )
    {
        $this.removeClass( "task_current_mouseover" ).addClass( "task_current" );
    }
}

function AddTask ( TaskName, Timer ) {
    var CloseButton,
        MainTaskDiv,
        Task,
        TaskArr_JSON,
        TaskArr = {};

    if ( TaskName != "" )
    {
        TaskArr = RetrieveTaskArr();

        if ( ! (TaskName in TaskArr) )
        {
            TaskArr[TaskName] = Timer;
            SaveTaskArr ( TaskArr );
        }


        if ( $("#" + TaskName).length != 0 )
        {
            alert ( "That task already exists!" );
        }
        else
        {
            MainTaskDiv = $( '<div id="' + TaskName + '_main" class="main_task_div"></div>' );
            CloseButton = $( '<div id="' + TaskName + '_remove" class="close_task_div">'   +
                             '&otimes;</div>' );
            Task = $( '<div id="' + TaskName + '" class="task_div">' +
                      '  <table class="task_inactive">'              +
                      '      <tr>'                +
                      '          <td>' + TaskName + '</td>'          +
                      '      </tr>'               +
                      '      <tr>'                +
                      '          <td id="timer">' + Timer + '</td>'  +
                      '      </tr>'               +
                      '  </table>'                +
                      '</div>' );
            MainTaskDiv.append ( CloseButton );
            MainTaskDiv.append ( Task );

            //
            //  Add click handlers.
            CloseButton.click ( RemoveTask );
            Task.click ( StartTimer );
            Task.children('table').hover( MouseEnterTask, MouseLeaveTask );

            //
            //  Add to the DOM.
            $( "#TaskList" ).append( MainTaskDiv );
        }
    }
} 

function SubmitTask ( event ) {
    var TaskName = $( "#TaskName" ).val();

    event.preventDefault();
    event.stopPropagation();

    AddTask ( TaskName, 0 );
} 

$(document).ready(function () {
    var TaskArr;

    //
    //  Submit hanlder for the task form.
    $( "#TaskForm" ).submit( SubmitTask );

    //
    //  Looks like a previous instance of this program stored some tasks in DOM
    //  storage.  Retrieve and display them.
    TaskArr = RetrieveTaskArr();
    for ( var key in TaskArr )
    {
        AddTask ( key, TaskArr[key] );
    }
});

//
// vim: ts=4 sw=4 expandtab
//
