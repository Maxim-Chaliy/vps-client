import '../Components/style/home.css';
import logo  from "../img/Group8.png";
import rectengale from "../img/Rectangle10.png";
import Group9 from "../img/Group9.png";
import Check from "../img/check.png";
import Header from '../Components/Header';
import Footer from '../Components/Footer';
const Home = () => {
  return (
  <>
      
      <Header/>
        <main className="test">
          <div className="box-2">
            <div className="conteiner">
              <div className="display-flex">
                <div className="content-1">
                  <div className="flex-4">
                    <div className="content-text-1"><p className="text-1">Занятия по подготовке к ЕГЭ</p></div>
                    <div className="img-2"><img src={rectengale} alt="" /></div>
                  </div>
                  <div className="content-text-2"><p className="text-2">Сдавай ЕГЭ на высокие баллы</p></div>
                  <div className="content-text-3"><p className="text-3">Подготовим к ЕГЭ 2024 на высокий балл, поможем выбрать профессию мечты и поступить в вуз на бюджет</p></div>
                  <div className="flex-5">
                    <div className="button-go"><div className="block-ots-teg-a-start-preparing"><a className="teg-a-start-preparing" href="/online-repetitor/EGE.html">НАЧАТЬ ПОДГОТОВКУ</a></div></div>
                    <div className="img-3"><img src={Group9} alt="" /></div>
                  </div>
                </div>
                <div className="position-block-1">
                  <div className="block-1">
                    <div className="block-2"><img src={logo} alt="" /></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="block-3">
            <div className="conteiner">
              <section className="title">
                <h1>Подготовка к ЕГЭ на курсах – не просто решение тестов<br />
                  Ученики сдают на 80+ благодаря комплексному подходу к обучению</h1>
              </section>
              <div className="content-2">
                <div className="box-content-1">
                  <div className="flex-9">
                    <div className="number"><p>1</p></div>
                    <div className="title-1"><p>Глубокое понимание предмета</p></div>
                  </div>
                  <div className="flex-8">
                    <div className="text-5"><span>Цель преподавателя<br /> — чтобы каждый<br /> ученик разобрался в<br /> каждой теме.</span></div>
                    <div className="spis">
                      <div className="flex-10">
                        <img className="img-5" src={Check} alt="" />
                        <div className="text-ots-1"><p>Никаких правил с малопонятными терминами,<br /> а удобные схемы</p></div>
                      </div>
                      <div className="flex-10">
                        <img className="img-5" src={Check} alt="" />
                        <div className="text-ots-1"><p>Открываем новое и интересное в языке</p></div>
                      </div>
                      <div className="flex-10">
                        <img className="img-5" src={Check} alt="" />
                        <div className="text-ots-1"><p>Учимся общаясь и задавая вопросы,<br /> а не слушая скучные лекции</p></div>
                      </div>

                    </div>
                  </div>
                </div>
                <div className="box-content-1" style={{ marginTop: '70px' }}>
                  <div className="flex-9">
                    <div className="number"><p>2</p></div>
                    <div className="title-1"><p>Дисциплина в учебе</p></div>
                  </div>
                  <div className="flex-8">
                    <div className="text-5"><span>Помогаем школьнику<br /> выработать<br /> самодисциплину и<br /> привычку учиться</span></div>
                    <div className="spis">
                      <div className="flex-10">
                        <img className="img-5" src={Check} alt="" />
                        <div className="text-ots-1"><p>Ставим строгие дедлайны дз</p></div>
                      </div>
                      <div className="flex-10">
                        <img className="img-5" src={Check} alt="" />
                        <div className="text-ots-1"><p>Обучаем тайм-менеджменту</p></div>
                      </div>
                      <div className="flex-10">
                        <img className="img-5" src={Check} alt="" />
                        <div className="text-ots-1"><p>Создали атмосферу, где пропускать занятия - <br />не круто</p></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="box-content-1" style={{ marginTop: '70px' }}>
                  <div className="box-content-1">
                    <div className="flex-9">
                      <div className="number"><p>3</p></div>
                      <div className="title-1"><p>Внутренняя мотивация</p></div>
                    </div>
                    <div className="flex-8">
                      <div className="text-5"><span>Не принуждаем к<br />занятиям, а<br />пробуждаем<br />любопытство к<br />познанию</span></div>
                      <div className="spis">
                        <div className="flex-10">
                          <img className="img-5" src={Check} alt="" />
                          <div className="text-ots-1"><p>Приводим примеры из реальной жизни</p></div>
                        </div>
                        <div className="flex-10">
                          <img className="img-5" src={Check} alt="" />
                          <div className="text-ots-1"><p>Объясняем сложный материал простым<br /> языком</p></div>
                        </div>
                        <div className="flex-10">
                          <img className="img-5" src={Check} alt="" />
                          <div className="text-ots-1"><p>Проводим занятия в формате диалога,<br /> а не лекций</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      <Footer/>
    </>
  );
}

export default Home;
