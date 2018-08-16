import {Component, Input, OnChanges, OnInit} from '@angular/core';

import {Position} from '../../../position';
declare var google: any;

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})

export class GraphComponent implements OnChanges, OnInit {
  @Input() userTimestamps: Position[];
  data: any;

  constructor() {
    google.charts.load('current', {'packages': ['corechart']});
  }

  public BuildChart(): void {
    const chartFunc = () => new google.visualization.ScatterChart(document.getElementById('timeChart'));
    const options = {
      // Trigger tooltips on selections.
      tooltip: {trigger: 'selection'},
      // Group selections by x-value.
      aggregationTarget: 'series',
      hAxis: {
        title: 'Giorni',
        format: 'M/d/yy'
      },
      vAxis: {
        title: 'Ore',
        format: 'HH:mm'
      },
    };

    const func = (cb, opt) => {
      this.data = new google.visualization.DataTable();

      this.data.addColumn('date', 'Giorno');
      this.data.addColumn('timeofday', 'Ora');

      if (this.userTimestamps !== undefined ) {
        this.userTimestamps.forEach(p => {
          const date = new Date(p.timestamp * 1000);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          this.data.addRows( [[date, [hours, minutes, 0]]] );
        });
      }

      cb().draw(this.data, opt);
    };

    const callback = () => func(chartFunc, options);
    google.charts.setOnLoadCallback(callback);

  }

  ngOnInit() {
    this.BuildChart();
  }

  ngOnChanges() {
    this.BuildChart();
  }
}
