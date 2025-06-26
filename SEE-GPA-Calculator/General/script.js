document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const allInputs = [...document.querySelectorAll('.gpa-input, .ecs-gpa-input')];
  allInputs.forEach((input, index) => {
    input.required = true;

    let lastBackspaceTime = 0;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (index + 1 < allInputs.length) allInputs[index + 1].focus();
      }

      if (e.key === 'Backspace') {
        const now = Date.now();

        setTimeout(() => {
          if (input.value === '') {
            // Only go to previous if backspace pressed twice with small gap
            if (now - lastBackspaceTime < 500 && index > 0) {
              allInputs[index - 1].focus();
            }
            lastBackspaceTime = now;
          } else {
            lastBackspaceTime = 0;
          }
        }, 0);
      }
    });
  });

  // Mobile Nav (unchanged)
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay = document.getElementById('nav-overlay');
  const navClose = document.querySelector('.mobile-nav .nav-close');

  function openNav() {
    mobileNav.classList.add('open');
    overlay.classList.add('open');
    navToggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    mobileNav.classList.remove('open');
    overlay.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () =>
    mobileNav.classList.contains('open') ? closeNav() : openNav()
  );
  navClose.addEventListener('click', closeNav);
  overlay.addEventListener('click', closeNav);
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });
});

function getLetterGrade(gpa) {
  if (gpa >= 3.60) return "A+";
  if (gpa >= 3.20) return "A";
  if (gpa >= 2.80) return "B+";
  if (gpa >= 2.40) return "B";
  if (gpa >= 2.00) return "C+";
  if (gpa >= 1.60) return "C";
  if (gpa >= 1.20) return "D+";
  if (gpa >= 0.80) return "D";
  return "E";
}

document.getElementById("calculate-btn").addEventListener("click", function () {
  const errorMsgEl = document.getElementById('error-msg');
  errorMsgEl.textContent = '';
  document.querySelectorAll('input.input-error').forEach(i => i.classList.remove('input-error'));

  let hasError = false;
  document.querySelectorAll('.gpa-input, .ecs-gpa-input').forEach(input => {
    const v = input.value.trim(), n = parseFloat(v);
    if (v === "" || isNaN(n) || n < 0 || n > 4) {
      input.classList.add('input-error');
      hasError = true;
    }
  });

  if (hasError) {
    errorMsgEl.textContent = 'Please fill all GPA fields with values between 0.00 and 4.00.';
    errorMsgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const mainRows = document.querySelectorAll("#main-subjects-table tbody tr");
  const subjects = {};
  mainRows.forEach(row => {
    const subj = row.dataset.subject;
    const inp = row.querySelector('.gpa-input');
    const cr = +inp.dataset.credit;
    const gv = +inp.value;
    const ptEl = row.querySelector('.subject-point');
    const fgEl = row.querySelector('.final-grade');
    subjects[subj] = subjects[subj] || { rows: [] };
    subjects[subj].rows.push({ cr, gv, ptEl, fgEl });
  });

  let totalCred = 0, totalPoint = 0;
  for (const subj in subjects) {
    let sumCr = 0, sumPt = 0;
    subjects[subj].rows.forEach(item => {
      const p = item.gv * item.cr;
      item.ptEl.textContent = p.toFixed(2);
      sumCr += item.cr;
      sumPt += p;
    });
    const finalG = sumCr ? Math.round((sumPt / sumCr) * 100) / 100 : 0;
    const letg = getLetterGrade(finalG);
    subjects[subj].rows.forEach(item => {
      item.fgEl.textContent = `${finalG.toFixed(2)} (${letg})`;
    });
    totalCred += sumCr;
    totalPoint += sumPt;
  }

  // GPA (2 decimal only)
  const totalEl = document.getElementById("total-gpa");
  let tgpa = totalCred ? totalPoint / totalCred : 0;
  tgpa = Math.round(tgpa * 100) / 100;
  totalEl.textContent = `${tgpa.toFixed(2)} (${getLetterGrade(tgpa)})`;

  // Check if ECS table exists before processing ECS
  const ecsTable = document.querySelector("#ecs-table");
  if (ecsTable) {
    const ecsRows = ecsTable.querySelectorAll("tbody tr");
    let ecsCr = 0, ecsPt = 0;
    ecsRows.forEach(row => {
      const inp = row.querySelector('.ecs-gpa-input');
      const cr = +inp.dataset.credit;
      const gv = +inp.value;
      const p = gv * cr;
      row.querySelector('.subject-point').textContent = p.toFixed(2);
      ecsCr += cr;
      ecsPt += p;
    });
    const ecsG = ecsCr ? Math.round((ecsPt / ecsCr) * 100) / 100 : 0;
    ecsRows.forEach(row => {
      row.querySelector('.final-grade').textContent = `${ecsG.toFixed(2)} (${getLetterGrade(ecsG)})`;
    });

    const totalEcsEl = document.getElementById("total-gpa-ecs");
    if (totalEcsEl) {
      const combCr = totalCred + ecsCr;
      const combPt = totalPoint + ecsPt;
      let totalAll = combCr ? combPt / combCr : 0;
      totalAll = Math.round(totalAll * 100) / 100;
      totalEcsEl.textContent = `${totalAll.toFixed(2)} (${getLetterGrade(totalAll)})`;
    }
  }
});
