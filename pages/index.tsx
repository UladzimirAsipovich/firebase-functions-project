import { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import type { I_useButtonResult } from '../components/Button/Button';
import type { I_Doc } from '../components/Firebase';
import { requestUser, updateUser, restoreToDefault } from '../components/Firebase';
import Button, { useButton } from '../components/Button/Button';

const Index: NextPage = (): JSX.Element => {

  // Page states

  const [inputSearch, setInputSearch] = useState<string>('');

  const [preSearch, setPreSearch] = useState<string | null>(null);
  const [preUpdate, setPreUpdate] = useState<string | null>(null);

  // Buttons states

  const searchBtn = useButton();

  const updateBtn1 = useButton();
  const updateBtn2 = useButton();
  const updateBtn3 = useButton();

  const onSearch = useCallback(async () => {
    const { processing } = searchBtn.controls;

    processing(true);
    setPreSearch('');

    try {
      if (!inputSearch) {
        processing(false);
        throw 'Введите ID пользователя для поиска!';
      };

      // for imitate slow connection
      await new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const res = await requestUser(inputSearch);

            if (!res) {
              setPreSearch('По вашему запросу ничего не найдено!');
              return reject('По вашему запросу ничего не найдено!');
            }

            setPreSearch(JSON.stringify(res.data, null, 2));
            return resolve(true);

          } catch (e) {
            setPreSearch(e as string);
            console.error("Произошла ошибка: ", e);
            return reject(e);
          } finally {
            processing(false);
            setInputSearch('');
          }

        }, 1000);
      });

    } catch (error) {
      setPreSearch(error as string);
      console.error("Произошла ошибка: ", error);
    }
  }, [inputSearch]);

  const onUpdate = useCallback(async (btn: I_useButtonResult, updateParam: I_Doc["data"]) => {

    const { processing } = btn.controls;

    processing(true);
    setPreUpdate('');

    try {

      // for imitate slow connection
      await new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {

            const res = await updateUser(updateParam);

            if (!res) {
              setPreUpdate('Обновление не удалось! По вашему запросу ничего не найдено!');
              return reject('Обновление не удалось! По вашему запросу ничего не найдено!');
            }

            setPreUpdate(JSON.stringify(res, null, 2));
            return resolve(true);

          } catch (e) {
            setPreUpdate(e as string);
            console.error("Произошла ошибка: ", e);
            return reject(e);
          } finally {
            processing(false);
          }

        }, 1000);
      });

    } catch (error) {
      setPreUpdate(error as string);
      console.error("Произошла ошибка: ", error);
    }
  }, []);

  return (
    <>
      <main className='p-4'>
        <div className='container mx-auto border-4 rounded-xl p-4 mb-4'>
          <div className='text-xs'>
            <p className='mb-4'>1) User request by id <strong>requestUser(id)</strong> returns json of all user fields. Let&apos; s assume you don&apos;t know the exact user structure (fields). Could be variable fields.</p>
            <p className='mb-4'>
              <span className='inline-block mb-4'>Examples:</span>
              <br />
              <span className=''>&#123; <span className='italic'>id:</span> &quot;<strong>Alex</strong>&quot;, score: 24 &#125;</span>
              <br />
              <span>&#123; <span className='italic'>id:</span> &quot;<strong>1234</strong>&quot;, points: 14, somefield: &quot;something&quot;, foo: &quot;bar&quot; &#125;</span>
            </p>
            <p className='mb-4'>So really any kind of JSON. id should be a key in firestore for that user record too.</p>
          </div>

          <div className='flex flex-col sm:flex-row'>
            <div className='flex items-start mr-4'>
              <input className='rounded-lg border mr-4 last:mr-0 hover:shadow-md outline-none px-4 py-2 shrink-1 min-w-0'
                type="text" max={50} placeholder={'Enter ID'} value={inputSearch}
                onChange={e => setInputSearch(e.target.value)}
              />
              <Button {...searchBtn.params} onClick={onSearch} title='Search' theme='danger' size='lg' className='uppercase'>
                <span>Search</span>
              </Button>
            </div>
            <div className='overflow-hidden'>
              <pre>{preSearch ? preSearch : null}</pre>
            </div>
          </div>
        </div>
        <div className='container mx-auto border-4 rounded-xl p-4'>
          <div className='text-xs'>
            <p className='mb-4'>2) Add OR update user <strong>updateUser(user)</strong>.</p>
            <p className='mb-4'>Creates (if it doesn&apos;t exist) or modifies an existing user. </p>
            <p className='mb-4'>In the parameters, you can transfer <span className='underline'>all or part</span> of the user&apos;s fields — if no user with such id exists — the user will be created, otherwise, the existing user record should be updated.</p>
            <p className='mb-4'>By default all number fields don&apos;t just get overwritten — they add up to existing values (+=). </p>
            <p className='mb-4'>Also there should be a simple possibility to change this in the code to just = for some of the fields - please comment that place in code.</p>
            <p className='mb-4 underline'>For example fields &apos;coins_left&apos;, &apos;last_game_number&apos; when passed just overwrite existing values in these fields.</p>
            <p className='mb-4'>
              <span className='inline-block mb-4'>Example:</span>
              <br />
              <span className='italic font-bold'>updateUser(&#123; <strong>id: &quot;Alex&quot;</strong>, score: 1 &#125;);</span>
            </p>
            <p className='mb-4'>If no user &apos;alex&apos; exists, it will create a user with id &apos;alex&apos;, and if a user with id &apos;alex&apos; already exists, it will add the value score += 1. So if you call that func twice it should update the score to 2.</p>
            <p className="mb-4">If existing user &apos;alex&apos; doesn&apos;t have a &apos;score&apos; field it should just add it with value = 1. On the second call it should be updated to 2.</p>
            <p className="mb-4">If user &apos;alex&apos; exists with score = 10, that call should update it to score = 11</p>
            <p className="mb-4"><span className='italic font-bold'>updateUser(&#123; id: &quot;alex&quot;, coins_left: 50, games_completed: 1&#125;);</span> </p>
            <p className="mb-4">Updates user &apos;alex&apos; field &apos;coins_left&apos; to the value of 50, and games_completed +=1</p>
            <p className="mb-4"></p>
            <p className="mb-4"></p>
            <p className="mb-4"></p>
          </div>

          <div className='flex flex-col sm:flex-row'>
            <div className='flex flex-col flex-wrap sm:w-full md:w-2/3 items-start mb-4 sm:mb-0'>

              <Button {...updateBtn1.params} title='Update' theme='info' size='lg' className='uppercase w-full sm:w-auto'
                onClick={() => onUpdate(updateBtn1, { id: "Ivan" })}
              >
                <span>Update</span>
                <br />
                <small className='text-xs text-yellow-300'>updateUser(&#123; <strong>id: &quot;Ivan&quot;</strong> &#125;);</small>
              </Button>

              <Button {...updateBtn2.params} title='Update' theme='primary' size='lg' className='uppercase w-full sm:w-auto'
                onClick={() => onUpdate(updateBtn2, { id: "Ivan", coins_left: 50, games_completed: 1 })}
              >
                <span>Update</span>
                <br />
                <small className='text-xs text-yellow-300'>updateUser(&#123; id: &quot; Ivan&quot;, coins_left: 50, games_completed: 1&#125;);</small>
              </Button>

              <Button {...updateBtn3.params} title='Restore' theme='warn' size='lg' className='uppercase w-full sm:w-auto'
                onClick={async () => {
                  updateBtn3.controls.processing(true);
                  setPreUpdate('');
                  try {
                    const res = await restoreToDefault();
                    setPreUpdate(JSON.stringify(res, null, 2));
                  } catch (error) {
                    console.log(error);
                    setPreUpdate(error as string);
                  } finally {
                    updateBtn3.controls.processing(false);
                  }
                }}
              >
                <span>Restore to default</span>
                <br />
                <small className='text-xs text-red-900'>Set collection &quot;Users&quot; to examples from task 1</small>
              </Button>

            </div>
            <div className='overflow-hidden'>
              <pre>{preUpdate ? preUpdate : null}</pre>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Index;