$(document).ready(() => {
  // create a div wrapper time table
  const rootDivPanel = document.createElement('div');
  rootDivPanel.setAttribute('id', 'container_HKIT');
  rootDivPanel.style.height = $(window).height();
  rootDivPanel.innerHTML = `
    <a id="btn_close_tkb">Đóng</a>
    <div class="author"><h1>TKB Extension by<br />Võ Hoàng Kiệt - Trần Hữu Khương</h1></div>
  `;
  // rootDivPanel.innerHTML = `
  //   <div id="studentInfo">
  //     <span class="text-mutted mr-2">MSSV:</span>
  //     <span class="info-text-color" id="studentId"></span>
  //     <span class="text-mutted mr-2 space_left">Họ tên:</span>
  //     <span class="info-text-color" id="studentName"></span>
  //     <span class="text-mutted mr-2 space_left">Lớp:</span>
  //     <span class="info-text-color" id="studentFaculty"></span>
  //   </div>
  // `;
  const btn_open = document.createElement('a');
  btn_open.innerHTML = `<a id="btn_open_tkb">Xem thời khoá biểu</a>`;

  $('body').append(rootDivPanel);
  $('body').append(btn_open);

  $('#btn_open_tkb').click(() => {
    rootDivPanel.style.display = 'flex';
    $('#btn_open_tkb').css('display', 'none');
    $('#btn_close_tkb').css('display', 'block');

    isDraw = true;
  });

  $('#btn_close_tkb').click(() => {
    rootDivPanel.style.display = 'none';
    $('#btn_close_tkb').css('display', 'none');
    $('#btn_open_tkb').css('display', 'block');
  });

  // create table element
  const table = document.createElement('table');
  table.setAttribute('id', 'table_HKIT');
  table.innerHTML = `
    <thead>
        <td class="stt bg-white"></td>
        <td class="thead_td">Thứ Hai</td>
        <td class="thead_td">Thứ Ba</td>
        <td class="thead_td">Thứ Tư</td>
        <td class="thead_td">Thứ Năm</td>
        <td class="thead_td">Thứ Sáu</td>
        <td class="thead_td">Thứ Bảy</td>
        <td class="stt bg-white"></td>
      </thead>
    <tbody id="body_HKIT"></tbody>
  `;
  rootDivPanel.append(table);

  // Vẽ bảng rỗng
  const table_body = $('#body_HKIT');
  // vẽ 12 hàng ngang
  for (let i = 1; i <= 12; i++) {
    const row = document.createElement('tr');
    for (let j = 1; j <= 8; j++) {
      const className = 'col_basic';
      const col = document.createElement('td');
      if (j == 1 || j == 8) {
        col.className = 'stt';
        col.innerHTML = '<div>' + 'Tiết ' + i + '</div>';
      } else {
        col.id = `d${j}_s${i}`;
        col.className = className;
      }
      row.append(col);
    }
    table_body.append(row);
  }

  const processData = () => {
    const divNode = $('.grid-roll2')[0];
    const courseList = divNode.children;

    const listResults = [];

    for (let element of courseList) {
      const item = element.querySelectorAll('td');
      const itemWidth35 = element.querySelectorAll('td[width*="35px"');
      const itemWidth40 = element.querySelectorAll('td[width*="40px"]');
      const itemWidth50 = element.querySelectorAll('td[width*="50px"]');

      const id = item[0].textContent;
      const name = item[1].textContent;
      const days = itemWidth40[0].textContent;
      const starts = itemWidth40[1].textContent;
      const totals = itemWidth40[2].textContent;
      const rooms = itemWidth50[0].textContent;
      const teachers = itemWidth35[4].textContent;

      const listDays = plaintextDatesToArray(days);
      const listRooms = plaintextRoomsToArray(rooms);
      const listStarts = plaintextStartsToArray(starts);
      const listTotals = plaintextStartsToArray(totals);
      const listTeachers = plaintextTeachersToArray(teachers);

      const length = listDays.length;
      for (k = 0; k < length; k++) {
        const weekdayName = listDays[k];
        const sectionStart = parseInt(listStarts[k]);
        const sectionTotal = parseInt(listTotals[k]);
        const sectionEnd = parseInt(sectionStart + sectionTotal - 1);
        const room = listRooms[k];
        const teacherCode = listTeachers[k];
        const teacherName = 'Chưa có thông tin';

        listResults.push({
          id: id,
          name: name.trim(),
          weekdayName: weekdayName,
          weekdayNumber: getDayNum(weekdayName),
          sectionStart: sectionStart,
          sectionEnd: sectionEnd,
          totalSection: sectionTotal,
          startTime: getTimeStart(sectionStart),
          endTime: getTimeEnd(sectionEnd),
          room: room,
          teacherCode: teacherCode,
          teacherName: teacherName,
          group: 0,
        });
      }
    }

    // Sort lại môn học theo mã môn
    const courseCount = listResults.length;
    for (let i = 0; i < courseCount - 1; i++) {
      for (let j = i + 1; j < courseCount; j++) {
        if (listResults[i].id < listResults[j].id) {
          swap(listResults[i], listResults[j]);
        }
      }
    }

    // Đánh số theo group môn
    let group = 0;
    let preId = listResults[0].id;
    for (let i = 0; i < courseCount; i++) {
      if (preId != listResults[i].id) {
        preId = listResults[i].id;
        group++;
      }
      listResults[i].group = group;
    }

    // Sort theo ngày học (thứ)
    for (let i = 0; i < courseCount - 1; i++) {
      for (let j = i + 1; j < courseCount; j++) {
        if (listResults[i].weekdayNumber > listResults[j].weekdayNumber) {
          swap(listResults[i], listResults[j]);
        }
      }
    }

    // Sort theo tiết bắt đầu
    for (let i = 0; i < courseCount - 1; i++) {
      for (let j = i + 1; j < courseCount; j++) {
        if (listResults[i].sectionStart > listResults[j].sectionStart) {
          swap(listResults[i], listResults[j]);
        }
      }
    }

    return listResults;
  };

  const swap = (a, b) => {
    const temp = a;
    a = b;
    b = temp;
  };

  const plaintextDatesToArray = (str) => {
    // input: SáuBảySáuBảy
    // output: [Sáu, Bảy, Sáu, Bảy]
    return str.split(/(?=[A-Z])/);
  };

  const plaintextRoomsToArray = (str) => {
    // input: C.S_A02C.S_A02
    const result = [];

    // input: C.A0021.B104
    const address = preg_match_all(/.\./, str);
    // const address = address[0];
    // output: [C., 1.]

    // input: C.A0021.B104
    const room = str.split(/.\./);
    room.shift();
    // output: [A002, B104]

    const n = room.length;
    for (let i = 0; i < n; i++) {
      result.push(address[0][i] + room[i]);
    }
    // output: [C.S_A02, C.S_A02]
    return result;
  };

  const preg_match_all = (regex, str) => {
    return [...str.matchAll(new RegExp(regex, 'g'))].reduce((acc, group) => {
      group
        .filter((element) => typeof element === 'string')
        .forEach((element, i) => {
          if (!acc[i]) acc[i] = [];
          acc[i].push(element);
        });

      return acc;
    }, []);
  };

  const plaintextStartsToArray = (str) => {
    // input: 1166
    // output: [1, 1, 6, 6]
    return str.split('');
  };

  const plaintextTeachersToArray = (str) => {
    // input: 1062410624
    // output: [10624, 10624]
    // return str.split('', 5);
    return str.match(/.{1,5}/g) || [];
  };

  const getDayNum = (dayString) => {
    switch (dayString) {
      case 'Hai':
        return 2;
      case 'Ba':
        return 3;
      case 'Tư':
        return 4;
      case 'Năm':
        return 5;
      case 'Sáu':
        return 6;
      case 'Bảy':
        return 7;
      default:
        return 1;
    }
  };

  const getTimeStart = (section) => {
    switch (section) {
      case 1:
        return '7:00';
      case 2:
        return '7:50';
      case 3:
        return '9:00';
      case 4:
        return '9:50';
      case 5:
        return '10:40';
      case 6:
        return '13:00';
      case 7:
        return '13:50';
      case 8:
        return '15:00';
      case 9:
        return '15:50';
      case 10:
        return '16:40';
      case 11:
        return '17:40';
      case 12:
        return '18:30';
      case 13:
        return '19:20';
    }
  };

  const getTimeEnd = (section) => {
    switch (section) {
      case 1:
        return '7:50';
      case 2:
        return '8:40';
      case 3:
        return '9:50';
      case 4:
        return '10:40';
      case 5:
        return '11:30';
      case 6:
        return '13:50';
      case 7:
        return '14:40';
      case 8:
        return '15:50';
      case 9:
        return '16:40';
      case 10:
        return '17:30';
      case 11:
        return '18:30';
      case 12:
        return '19:20';
      case 13:
        return '20:10';
    }
  };

  const drawTimetable = () => {
    const data = processData();
    data.map((item, index) => {
      const start = item.sectionStart;
      const day = item.weekdayNumber;
      const total = item.totalSection;

      const cell = $(`#d${day}_s${start}`);
      if (cell) {
        // cell.classList == 'course' : bị bỏ qua vì className không chỉ có mỗi course
        // API v2 đã fix lỗi này
        const classList = cell.attr('class') + '';
        if (classList == 'col_basic') {
          cell.attr('rowspan', total);

          cell.html(
            "<span class='text-color'>" +
              item.name +
              '</span>' +
              '<br />' +
              "<i class='text-mutted'>Phòng: </i>" +
              "<span class='text-color'>" +
              item.room +
              '</span>' +
              '<br />' +
              "<i class='text-mutted'>Giờ học: </i>" +
              "<span class='text-color'>" +
              item.startTime +
              ' -> ' +
              item.endTime +
              '</span>' +
              '<br />'
          );

          const courseType = item.group;
          cell.addClass('course');
          cell.addClass(`course-${courseType}`);

          let affected = item.sectionStart;
          for (let j = 0; j < item.totalSection - 1; j++) {
            affected++;
            const row = $(`#d${day}_s${affected}`);
            if (row != null) {
              row.remove();
            }
          }
        }
      }
    });
    // thêm hàng thứ vào cuối
    const lastRow = document.createElement('tr');
    lastRow.innerHTML =
      '<td class="stt bg-white"></td>' +
      '<td class="thead_td">Thứ Hai</td>' +
      '<td class="thead_td">Thứ Ba</td>' +
      '<td class="thead_td">Thứ Tư</td>' +
      '<td class="thead_td">Thứ Năm</td>' +
      '<td class="thead_td">Thứ Sáu</td>' +
      '<td class="thead_td">Thứ Bảy</td>' +
      '<td class="stt bg-white"></td>';
    table_body.append(lastRow);

    // Get thông tin sinh viên
    const msv = $('#ctl00_ContentPlaceHolder1_ctl00_lblContentMaSV').text();
    let hoTen = $('#ctl00_ContentPlaceHolder1_ctl00_lblContentTenSV').text();
    hoTen = hoTen.replace(':', ': ');
    const khoa = $('#ctl00_ContentPlaceHolder1_ctl00_lblContentLopSV').text();
    $('#studentId').text(msv);
    $('#studentName').text(hoTen);
    $('#studentFaculty').text(khoa);
  };

  drawTimetable();
});
