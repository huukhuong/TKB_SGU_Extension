$(document).ready(async () => {

  const currentUserString = sessionStorage.getItem('CURRENT_USER');
  if (!currentUserString) {
    throw new Error('No current user found');
  }

  const currentUser = JSON.parse(currentUserString);
  const accessToken = currentUser.access_token;

  const currentSemester = await fetchCurrentSemester(accessToken);
  const scheduleResponse = await fetchSemesterData(currentSemester, accessToken);

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

    // Draw an empty table
    const table_body = $('#body_HKIT');
    // draw 12 horizontal rows
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

      const listResults = convertToArray(scheduleResponse);


      // Sort subjects by subject code
      const courseCount = listResults.length;
      for (let i = 0; i < courseCount - 1; i++) {
        for (let j = i + 1; j < courseCount; j++) {
          if (listResults[i].id < listResults[j].id) {
            swap(listResults[i], listResults[j]);
          }
        }
      }

      // Numbering by subject group
      let group = 0;
      let preId = listResults[0].id;
      for (let i = 0; i < courseCount; i++) {
        if (preId != listResults[i].id) {
          preId = listResults[i].id;
          group++;
        }
        listResults[i].group = group;
      }

      // Sort by class date (day)
      for (let i = 0; i < courseCount - 1; i++) {
        for (let j = i + 1; j < courseCount; j++) {
          if (listResults[i].weekdayNumber > listResults[j].weekdayNumber) {
            swap(listResults[i], listResults[j]);
          }
        }
      }

      // Sort by start period
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


/**
 * Fetches the current semester from the API.
 *
 * This function sends a POST request to the `w-locdshockytkbuser` endpoint of the SGU API.
 * It retrieves the list of semesters and returns the most recent one based on sorting by `hoc_ky`.
 *
 * @param {string} accessToken - The access token used for authorization in the API request.
 * @returns {Promise<string>} - A promise that resolves to the most recent semester (hoc_ky).
 * @throws {Error} - Throws an error if no semesters are found in the response.
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

    // Get the latest semester (first semester after sorting)
    return response.data.ds_hoc_ky[0].hoc_ky;
  }

/**
 * Fetches semester data for a specific semester from the API.
 *
 * This function sends a POST request to the `w-locdstkbhockytheodoituong` endpoint of the SGU API.
 * It retrieves data for the given semester and returns the result.
 *
 * @param {string} hocKy - The semester code (hoc_ky) to fetch data for.
 * @param {string} accessToken - The access token used for authorization in the API request.
 * @returns {Promise<Object>} - A promise that resolves to the data returned by the API.
 * @throws {Error} - Throws an error if the request fails.
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
   * Converts data from the API response into an array of course objects.
   *
   * This function processes the input data, which is expected to have a structure 
   * containing an array of course groups. It maps each course group into a new object
   * with a specific format, including properties like ID, name, weekday, start and end
   * times, room, and teacher information.
   *
   * @param {Object} data - The raw data from the API response.
   * @returns {Array<Object>} - An array of course objects with the following properties:
   *   - id: The course ID.
   *   - name: The course name, trimmed of whitespace.
   *   - weekdayName: The day of the week as a string.
   *   - weekdayNumber: The day of the week as a number.
   *   - sectionStart: The start section of the course.
   *   - sectionEnd: The end section of the course.
   *   - totalSection: The total number of sections for the course.
   *   - startTime: The start time of the course.
   *   - endTime: The end time of the course.
   *   - room: The room where the course is held.
   *   - teacherCode: The code of the teacher.
   *   - teacherName: The name of the teacher.
   *   - group: A fixed value of 0, indicating no specific group classification.
   */
  function convertToArray(data) {

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
