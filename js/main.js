$(document).ready(async () => {



  const currentUserString = sessionStorage.getItem('CURRENT_USER');
  if (!currentUserString) {
    throw new Error('No current user found');
  }

  const currentUser = JSON.parse(currentUserString);
  const accessToken = currentUser.access_token;

  const currentSemester = await fetchCurrentSemester(accessToken);
  const scheduleResponse  = await fetchSemesterData(currentSemester, accessToken);

  const main = () => {
    const pathName = window.location.href;
    if (!pathName.includes("tkb")) {
      return;
    }
    // create a div wrapper time table
    const rootDivPanel = document.createElement('div');
    rootDivPanel.setAttribute('id', 'container_HKIT');
    rootDivPanel.style.height = $(window).height();
    rootDivPanel.innerHTML = `
      <a id="btn_close_tkb">Đóng</a>
      <div class="author"><h1>TKB Extension by<br />Võ Hoàng Kiệt - Trần Hữu Khương</h1></div>
    `;
    const btn_open = document.createElement('a');
    btn_open.innerHTML = `<a id="btn_open_tkb">Xem thời khoá biểu</a>`;

    $('body').append(rootDivPanel);
    $('body').append(btn_open);

    $('#btn_open_tkb').click(() => {
      rootDivPanel.style.display = 'flex';
      $('#btn_open_tkb').css('display', 'none');
      $('#btn_close_tkb').css('display', 'block');

      drawTimetable();
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
      const rowDataArray = [];
      
      const listResults = convertToArray(scheduleResponse);

      for (let element of rowDataArray) {
        const id = element.maMH;
        const name = element.tenMH;
        const day = element.thu;
        const start = element.tietBD;
        const total = element.soTiet;
        const room = element.phong;
        const teacher = element.giangVien;

        listResults.push({
          id: id,
          name: name.trim(),
          weekdayName: day,
          weekdayNumber: day,
          sectionStart: start,
          sectionEnd: start + total - 1,
          totalSection: total,
          startTime: getTimeStart(start),
          endTime: getTimeEnd(start + total - 1),
          room: room,
          teacherCode: teacher,
          teacherName: teacher,
          group: 0,
        });
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
              "<i class='text-mutted'>Giảng viên: </i>" +
              "<span class='text-color'>" +
              item.teacherName +
              '</span>'
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
  }

  main();

  /* Lấy thông tin các học kỳ sau đó trả về cái học kỳ mới nhất
  */

  async function fetchCurrentSemester(accessToken) {
    const response = await $.ajax({
      url: 'https://thongtindaotao.sgu.edu.vn/api/sch/w-locdshockytkbuser',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        filter: {
          is_tieng_anh: null
        },
        additional: {
          paging: {
            limit: 100,
            page: 1
          },
          ordering: [
            {
              name: 'hoc_ky',
              order_type: 1
            }
          ]
        }
      }),
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });

    if (!response.data.ds_hoc_ky.length) {
      throw new Error('No semesters found');
    }

    // Lấy học kỳ mới nhất (học kỳ đầu tiên sau khi sắp xếp)
    return response.data.ds_hoc_ky[0].hoc_ky;
  }

  /**
   * Lấy thông tin thời khóa biểu theo học kỳ
   * @param {*} hocKy 
   * @param {*} accessToken 
   * @returns 
   */
  async function fetchSemesterData(hocKy, accessToken) {
    return await $.ajax({
      url: 'https://thongtindaotao.sgu.edu.vn/api/sch/w-locdstkbhockytheodoituong',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        hoc_ky: hocKy,
        loai_doi_tuong: 1,
        id_du_lieu: null
      }),
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });
  }


  /**
   *  Convert scheduler response to data can draw
   */
  function convertToArray(schedulerResponse) {
    
    return data.data.ds_nhom_to.map((item) => {
        const {
            id_to_hoc: id,
            ten_mon: name,
            thu: day,
            tbd: start,
            so_tiet: total,
            tu_gio: startTime,
            den_gio: endTime,
            phong: room,
            gv: teacher
        } = item;

        return {
            id,
            name: name.trim(),
            weekdayName: day,
            weekdayNumber: day,
            sectionStart: start,
            sectionEnd: start + total - 1,
            totalSection: total,
            startTime: startTime,
            endTime: endTime,
            room,
            teacherCode: teacher,
            teacherName: teacher,
            group: 0,
        };
    });
}
});
