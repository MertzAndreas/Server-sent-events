const source = new EventSource("http://localhost:3000/events");
let penis = [];

source.addEventListener("message", function(event) {
  const data = JSON.parse(event.data);
  data.forEach((task) => {
    let taskData = {
      x: [task.TaskAttributes.StartDate, task.TaskAttributes.EndDate],
      y: task.TaskName,
      assigne: task.TaskAttributes.Assignee,
      status: task.TaskAttributes.Status,
    };
    penis.push(taskData);
  });

  // Update chart with the new data
  updateChart(penis);
});

function updateChart(data) {
  // Get chart instance
  const chart = Chart.getChart("myChart");
  console.log(chart)

  // Update chart data and redraw
  chart.data.datasets[0].data = data;
  chart.update();
}


document.addEventListener('DOMContentLoaded', function() {
  const data = {
    datasets: [{
      label: 'Project Overview',
      data: penis,
      backgroundColor: [
        'rgba(255, 26, 104, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(0, 0, 0, 0.2)'
      ],
      borderColor: [
        'rgba(255, 26, 104, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(0, 0, 0, 1)'
      ],
      borderWidth: 1,
      borderSkipped: false,
      borderRadius: 10,
      barPercentage: 0.95
    }]
  };
  //------------PLUGINS-------------//
  //MAKES DOTTED LINE FOR CURRENT DATE
console.log(data.datasets[0].data)
const todayLine = {
  id : "todayline",
  beforeDatasetsDraw(chart, args, pluginOptions) {
    const {ctx, data, chartArea: { top, bottom, left, right}, scales: {x, y} } = chart;

    ctx.save()
    //TELLS NODE.JS THAT WE WANT TO START DRWING
    ctx.beginPath()
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 26, 104, 1)"
    //COLOR, WHITESPACE
    ctx.setLineDash ([3,6])
    //COORDINATES FOR START AND STOP DRAWING
    //GETPIXELFORVALUE IS A FUNCTION IN CHART.JS THAT IS ABLE TO FIND ELEMENTS SPECIFIC PIXELS
    ctx.moveTo(x.getPixelForValue(new Date()), top);
    ctx.lineTo(x.getPixelForValue(new Date()), bottom)
    ctx.stroke();
    ctx.setLineDash ([])
  } 
}
  const status = {
    id: "status",
    afterDatasetsDraw(chart, args, pluginOptions) {
      const {ctx, data, chartArea: { top, bottom, left, right, width}, scales: {x, y} } = chart;

      ctx.save()
      ctx.font = "bolder 20px sans-serif"
      ctx.fillstyle = "black";
      ctx.textBaseline = "middle";
      data.datasets[0].data.forEach((datapoint, index) => {
        ctx.fillText(datapoint.status, right+10, y.getPixelForValue(index));
    });
    ctx.restore();
  }
}
  //CREATES DISPLAYED NAMES SEEN ON THE LEFT SIDE OF THE CHART
  const assignedTasks = {
    id: "assignedTasks",
    afterDatasetsDraw(chart, args, pluginOptions) {
      const {ctx, data, chartArea: { top, bottom, left, right}, scales: {x, y} } = chart;
      ctx.save()
      ctx.font = "bolder 20px sans-serif"
      ctx.fillstyle = "black";
      ctx.textBaseline = "middle";
      data.datasets[0].data.forEach((penis, index) => {
        ctx.fillText(penis.assigne, 10, y.getPixelForValue(index));
      });
      ctx.restore();
    }
  }
  // CONFIGURATION FOR LAYOUT OF CHART
  const config = {
    type: 'bar',
    data,
    options: {
      responsive: true,
      layout: {
          padding: {
            //CREATES WHITE SPACE ON LEFT AND RIGHT SIDE OF CHART
            left: 100, 
            right: 100
          }
      },
      //DETERMINES WHETER THE Y OR X AXIS DISPLAY OUR TASKS
      indexAxis: "y",
      scales: {
        //CONFIGURATION FOR WHAT IS BEING DISPLAYED ON THE X AXIS
        x: {
          position: "top",
          type: "time",
          time: {
            unit: "day"
          },
          min: "2023-03-30",
          max: "2023-05-01"
        }
      },
      //THESE PLUGINS ARE FROM CHART.JS CONFIGURATION
      plugins: {
        legend: {
          display: false
        }
      }
    },
    //THESE PLUGINS LETS US MANIPULATE/DRAW ADDITIONAL INFORMATION TO THE CHART 
    //SEE PREVIOUSLY DECLARED PLUGINS IN THIS FILE
    plugins: [todayLine, assignedTasks, status]
  };
  //RENDER CHART 
  const myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
});